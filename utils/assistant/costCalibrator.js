/**
 * 内置金额换算器：对话结束 + 余额刷新后，用余额差分与 token 累加推算 cost/token
 */
import { BOOKKEEPING_DEFAULT_COST_RATE } from '@/constants/bookkeeping.js';
import {
  COST_CALIBRATION_BALANCE_EPSILON,
  COST_CALIBRATION_MIN_TOKENS,
  COST_CALIBRATION_MAX_SAMPLES,
} from '@/constants/costCalibration.js';
import { fetchApiKeySecretById } from '@/utils/apiKeyRepository.js';
import { resolvePlatformIdFromApiKey } from '@/utils/platformApiErrors.js';
import { resolveChatModelId } from '@/constants/platformChatModels.js';
import {
  getCostCalibrationProfile,
  listCostCalibrationProfiles,
  upsertCostCalibrationProfile,
} from '@/utils/assistant/costCalibrationStore.js';

function extractTurnTokens(usage = {}) {
  const total = Number(usage.total_tokens);
  if (Number.isFinite(total) && total > 0) {
    return total;
  }
  const prompt = Number(usage.prompt_tokens) || 0;
  const completion = Number(usage.completion_tokens) || 0;
  const sum = prompt + completion;
  return sum > 0 ? sum : 0;
}

function isFiniteBalance(value) {
  return Number.isFinite(Number(value));
}

function computeAverageRate(samples = []) {
  const valid = samples.filter(
    (item) => item.costPerToken > 0 && item.tokens >= COST_CALIBRATION_MIN_TOKENS
  );
  if (!valid.length) {
    return null;
  }
  const totalCost = valid.reduce((sum, item) => sum + item.costDelta, 0);
  const totalTokens = valid.reduce((sum, item) => sum + item.tokens, 0);
  if (totalTokens <= 0) {
    return null;
  }
  return totalCost / totalTokens;
}

function blendRate(previousRate, nextRate) {
  if (!Number.isFinite(nextRate) || nextRate <= 0) {
    return previousRate;
  }
  if (!Number.isFinite(previousRate) || previousRate <= 0) {
    return nextRate;
  }
  return previousRate * 0.65 + nextRate * 0.35;
}

export async function resolveChatModelContext(apiKeyId = '') {
  const id = String(apiKeyId || '').trim();
  if (!id) {
    return null;
  }
  const key = await fetchApiKeySecretById(id);
  const platformId = resolvePlatformIdFromApiKey(key);
  const storedModel = String(key.chatModel || '').trim();
  const modelName = resolveChatModelId(platformId, storedModel) || storedModel || 'unknown';
  return {
    apiKeyId: id,
    platformId,
    modelName,
    balanceCurrency: key.balanceCurrency || 'CNY',
    lastBalance: key.officialBalance,
  };
}

/**
 * 对话结束且余额已刷新后调用（默认内置流程，用户不可见）
 */
export async function applyCostCalibrationAfterBalanceSync({
  apiKeyId = '',
  platformId = '',
  modelName = '',
  balanceCurrency = 'CNY',
  previousBalance = null,
  newBalance = null,
  usage = null,
} = {}) {
  const id = String(apiKeyId || '').trim();
  const model = String(modelName || '').trim();
  if (!id || !model) {
    return null;
  }

  const tokenCount = extractTurnTokens(usage);
  const prev = isFiniteBalance(previousBalance) ? Number(previousBalance) : null;
  const next = isFiniteBalance(newBalance) ? Number(newBalance) : null;
  const currency = String(balanceCurrency || 'CNY').toUpperCase();

  const existing = getCostCalibrationProfile(id, model) || {
    apiKeyId: id,
    platformId: String(platformId || '').trim(),
    modelName: model,
    balanceCurrency: currency,
    pendingTokens: 0,
    lastBalance: prev,
    costPerToken: null,
    sampleCount: 0,
    samples: [],
  };

  const profile = {
    ...existing,
    platformId: existing.platformId || String(platformId || '').trim(),
    balanceCurrency: currency,
    lastBalance: next,
    updatedAt: new Date().toISOString(),
  };

  if (prev === null || next === null) {
    if (tokenCount > 0) {
      profile.pendingTokens = (Number(profile.pendingTokens) || 0) + tokenCount;
    }
    return upsertCostCalibrationProfile(profile);
  }

  const balanceDelta = Number((prev - next).toFixed(6));

  if (balanceDelta <= COST_CALIBRATION_BALANCE_EPSILON) {
    if (tokenCount > 0) {
      profile.pendingTokens = (Number(profile.pendingTokens) || 0) + tokenCount;
    }
    return upsertCostCalibrationProfile(profile);
  }

  if (balanceDelta < 0) {
    profile.pendingTokens = 0;
    return upsertCostCalibrationProfile(profile);
  }

  const pendingBefore = Number(profile.pendingTokens) || 0;
  const totalTokens = pendingBefore + tokenCount;
  if (totalTokens < COST_CALIBRATION_MIN_TOKENS) {
    profile.pendingTokens = totalTokens;
    return upsertCostCalibrationProfile(profile);
  }

  const observedRate = balanceDelta / totalTokens;
  const sample = {
    tokens: totalTokens,
    costDelta: balanceDelta,
    costPerToken: observedRate,
    pendingBefore,
    observedAt: new Date().toISOString(),
  };
  const samples = [sample, ...(profile.samples || [])].slice(0, COST_CALIBRATION_MAX_SAMPLES);
  const averaged = computeAverageRate(samples);
  profile.samples = samples;
  profile.sampleCount = samples.length;
  profile.costPerToken = blendRate(profile.costPerToken, averaged || observedRate);
  profile.pendingTokens = 0;

  return upsertCostCalibrationProfile(profile);
}

export function getCalibratedCostPerToken(apiKeyId = '', modelName = '') {
  const profile = getCostCalibrationProfile(apiKeyId, modelName);
  if (profile?.costPerToken > 0) {
    return {
      costPerToken: profile.costPerToken,
      currency: profile.balanceCurrency || 'CNY',
      calibrated: true,
      pendingTokens: profile.pendingTokens || 0,
    };
  }
  return {
    costPerToken: BOOKKEEPING_DEFAULT_COST_RATE,
    currency: profile?.balanceCurrency || 'CNY',
    calibrated: false,
    pendingTokens: profile?.pendingTokens || 0,
  };
}

export function estimateTokenCost({
  apiKeyId = '',
  modelName = '',
  platformId = '',
  tokenCount = 0,
} = {}) {
  const tokens = Number(tokenCount) || 0;
  if (tokens <= 0) {
    return {
      tokenCount: 0,
      costAmount: 0,
      calibrated: false,
    };
  }

  let profile = null;
  if (apiKeyId && modelName) {
    profile = getCostCalibrationProfile(apiKeyId, modelName);
  } else if (platformId) {
    profile =
      listCostCalibrationProfiles().find(
        (item) =>
          item.platformId === platformId &&
          item.costPerToken > 0 &&
          (!modelName || item.modelName === modelName)
      ) || null;
  }

  const rateInfo = profile?.costPerToken
    ? {
        costPerToken: profile.costPerToken,
        currency: profile.balanceCurrency || 'CNY',
        calibrated: true,
      }
    : getCalibratedCostPerToken(apiKeyId, modelName);

  const costAmount = Number((tokens * rateInfo.costPerToken).toFixed(4));
  return {
    apiKeyId: profile?.apiKeyId || apiKeyId,
    platformId: profile?.platformId || platformId,
    modelName: profile?.modelName || modelName,
    tokenCount: tokens,
    costAmount,
    costPerToken: rateInfo.costPerToken,
    currency: rateInfo.currency,
    calibrated: rateInfo.calibrated,
  };
}

export function buildCalibrationSummaryForPrompt() {
  return listCostCalibrationProfiles()
    .filter((item) => item.costPerToken > 0)
    .map((item) => ({
      apiKeyId: item.apiKeyId,
      platformId: item.platformId,
      modelName: item.modelName,
      costPerToken: Number(item.costPerToken.toFixed(8)),
      currency: item.balanceCurrency,
      pendingTokens: item.pendingTokens || 0,
      sampleCount: item.sampleCount || 0,
    }));
}
