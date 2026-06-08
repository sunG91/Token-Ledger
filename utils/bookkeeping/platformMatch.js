/**
 * 口述厂商 → 平台 / 已绑定 Key / 模型匹配
 */
import { fetchApiKeys } from '@/api/apiKeys.js';
import { PLATFORMS, getPlatform, isKnownPlatformId } from '@/constants/platforms.js';
import { resolveChatModelId } from '@/constants/platformChatModels.js';
import { isAssistantEligibleApiKey } from '@/utils/boundModels.js';
import { resolveApiKeyLogoPlatformId } from '@/utils/apiKeyLogo.js';
const PLATFORM_ALIASES = {
  deepseek: ['deepseek', '深度求索'],
  openai: ['openai', 'open ai', 'chatgpt', 'gpt', 'openai-api'],
  claude: ['claude', 'anthropic'],
  kimi: ['kimi', '月之暗面', 'moonshot'],
  qwen: ['qwen', '通义', '千问', 'tongyi', 'dashscope'],
  gemini: ['gemini', 'google'],
  mistral: ['mistral'],
  siliconflow: ['siliconflow', '硅基', '硅基流动'],
  openrouter: ['openrouter'],
};

function normalizeText(text = '') {
  return String(text).trim().toLowerCase();
}

export function resolvePlatformIdFromText(text = '') {
  const raw = String(text || '').trim();
  if (!raw) {
    return '';
  }
  const lower = normalizeText(raw);

  for (const [platformId, aliases] of Object.entries(PLATFORM_ALIASES)) {
    if (aliases.some((alias) => lower.includes(alias))) {
      return platformId;
    }
  }

  if (Object.prototype.hasOwnProperty.call(PLATFORMS, lower)) {
    return lower;
  }

  return '';
}

function resolveKeyPlatformId(key = {}) {
  return resolveApiKeyLogoPlatformId(key) || String(key.platformId || '').trim();
}

export function matchApiKeysByPlatform(keys = [], platformId = '') {
  const id = String(platformId || '').trim();
  if (!id || id === 'other') {
    return [];
  }
  return keys.filter((key) => {
    if (key.enabled === false) {
      return false;
    }
    const keyPlatform = resolveKeyPlatformId(key);
    return keyPlatform === id;
  });
}

function resolveKeyModelName(key = {}) {
  const platformId = resolveKeyPlatformId(key);
  const stored = String(key.chatModel || '').trim();
  if (!stored) {
    return resolveChatModelId(platformId, '') || '';
  }
  return resolveChatModelId(platformId, stored) || stored;
}

export function listCandidateModels(keys = []) {
  return keys
    .filter((key) => isAssistantEligibleApiKey(key))
    .map((key) => ({
      apiKeyId: key.id,
      platformId: resolveKeyPlatformId(key) || 'other',
      modelName: resolveKeyModelName(key),
      alias: key.alias || key.maskedKey || '',
    }))
    .filter((item) => item.modelName);
}

function matchModelHint(modelHint = '', candidates = []) {
  const hint = normalizeText(modelHint);
  if (!hint) {
    return null;
  }
  const exact = candidates.find((item) => normalizeText(item.modelName) === hint);
  if (exact) {
    return exact;
  }
  return (
    candidates.find((item) => normalizeText(item.modelName).includes(hint)) ||
    candidates.find((item) => hint.includes(normalizeText(item.modelName))) ||
    null
  );
}

/**
 * 根据草稿解析记账目标
 */
export async function resolveBookkeepingTarget(draft = {}) {
  const platformHint = String(draft.platformHint || '').trim();
  let platformId = resolvePlatformIdFromText(platformHint || draft.scenario || '');
  const keys = await fetchApiKeys();
  let matchedKeys = platformId ? matchApiKeysByPlatform(keys, platformId) : [];

  if (!platformId && matchedKeys.length) {
    platformId = resolveKeyPlatformId(matchedKeys[0]) || 'other';
  } else if (!platformId) {
    platformId = 'other';
  }

  const candidates = listCandidateModels(matchedKeys);
  const platform = getPlatform(platformId);
  const modelHint = String(draft.modelHint || '').trim();
  const matchedModel = matchModelHint(modelHint, candidates);

  let apiKeyId = draft.apiKeyId || '';
  let modelName = draft.modelName || '';
  let bound = false;

  if (matchedModel) {
    apiKeyId = matchedModel.apiKeyId;
    modelName = matchedModel.modelName;
    bound = true;
  } else if (candidates.length === 1) {
    apiKeyId = candidates[0].apiKeyId;
    modelName = candidates[0].modelName;
    bound = true;
  } else if (candidates.length > 1 && !modelHint) {
    bound = true;
  } else if (platformId === 'other') {
    modelName = modelHint || 'unknown';
    bound = false;
  } else if (isKnownPlatformId(platformId)) {
    modelName = modelHint || modelName || 'unknown';
    bound = false;
  }

  const tokenCount = Number(draft.tokenCount);
  const hasTokens = Number.isFinite(tokenCount) && tokenCount > 0;
  const needsModel = bound && candidates.length > 1 && !modelName;
  const needsTokens = (bound || platformId === 'other') && !!modelName && !hasTokens && !needsModel;

  return {
    platformId,
    platformName: platform.name,
    apiKeyId,
    modelName,
    tokenCount: hasTokens ? tokenCount : null,
    bound: bound || platformId === 'other',
    needsModel,
    needsTokens,
    candidateModels: candidates,
  };
}
