/**
 * 构建 AI 助手上下文：用户已对接 API Key（含备注/别名、余额快照）
 */
import { fetchApiKeys } from '@/api/apiKeys.js';
import { getPlatform } from '@/constants/platforms.js';
import { resolveChatModelId } from '@/constants/platformChatModels.js';
import { isAssistantEligibleApiKey } from '@/utils/boundModels.js';
import { resolveBalanceEndpoint } from '@/utils/apiKeyEndpoints.js';
import { resolveApiKeyLogoPlatformId } from '@/utils/apiKeyLogo.js';
import { getCalibratedCostPerToken } from '@/utils/assistant/costCalibrator.js';

function resolveKeyPlatformId(key = {}) {
  return resolveApiKeyLogoPlatformId(key) || String(key.platformId || '').trim() || 'other';
}

function resolveKeyModelName(key = {}) {
  const platformId = resolveKeyPlatformId(key);
  const stored = String(key.chatModel || '').trim();
  if (!stored) {
    return resolveChatModelId(platformId, '') || '';
  }
  return resolveChatModelId(platformId, stored) || stored;
}

function normalizeBoundKey(key = {}) {
  const platformId = resolveKeyPlatformId(key);
  const platform = getPlatform(platformId);
  const modelName = resolveKeyModelName(key);
  const calibration = getCalibratedCostPerToken(key.id, modelName);
  return {
    apiKeyId: key.id,
    platformId,
    platformName: platform.name,
    modelName,
    alias: String(key.alias || '').trim(),
    maskedKey: String(key.maskedKey || '').trim(),
    officialBalance: key.officialBalance ?? null,
    balanceCurrency: key.balanceCurrency || 'CNY',
    balanceQueryable: !!resolveBalanceEndpoint(key),
    chatEligible: isAssistantEligibleApiKey(key),
    enabled: key.enabled !== false,
    costPerToken: calibration.costPerToken,
    costCalibrated: calibration.calibrated,
    pendingCalibrationTokens: calibration.pendingTokens || 0,
  };
}

export async function buildAssistantBoundContext() {
  const keys = await fetchApiKeys();
  return keys
    .filter((key) => key.enabled !== false)
    .map(normalizeBoundKey)
    .filter((item) => item.chatEligible || item.balanceQueryable);
}

export async function buildBookkeepingBoundContext() {
  const all = await buildAssistantBoundContext();
  return all.filter((item) => item.chatEligible);
}
