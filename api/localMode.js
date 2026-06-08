/**
 * 本地模式开启校验 — 每次切换到本地模式时验证 API Key 与对话模型仍可用
 */
import {
  fetchApiKeySecretById,
  fetchApiKeyRecords,
  patchApiKeyRecord,
} from '@/utils/apiKeyRepository.js';
import { fetchModelList, isChatModelAvailable } from '@/utils/modelList.js';
import { resolvePlatformIdFromApiKey } from '@/utils/platformApiErrors.js';
import { isDefaultChatModelSentinel, resolveChatModelId } from '@/constants/platformChatModels.js';
import { isIntegratedPlatformId } from '@/constants/integratedPlatforms.js';
import {
  getLocalModeConfig,
  isLocalModeKeyConfigured,
  resolveModelsEndpoint,
  saveLocalModeConfig,
} from '@/utils/localModeConfig.js';

export const LOCAL_MODE_ERROR = {
  NO_CONFIG: 'NO_CONFIG',
  KEY_MISSING: 'KEY_MISSING',
  KEY_NOT_CONFIGURED: 'KEY_NOT_CONFIGURED',
  NO_MODELS_ENDPOINT: 'NO_MODELS_ENDPOINT',
  NO_CHAT_MODEL: 'NO_CHAT_MODEL',
  MODEL_UNAVAILABLE: 'MODEL_UNAVAILABLE',
  FETCH_FAILED: 'FETCH_FAILED',
};

export async function loadLocalModeCandidateKeys() {
  const list = await fetchApiKeyRecords();
  return list.filter((item) => item.enabled !== false);
}

export async function fetchModelsForApiKeyRecord(key = {}) {
  const secret = key.apiKey ? key : await fetchApiKeySecretById(key.id);
  const endpoint = resolveModelsEndpoint(secret);
  if (!endpoint) {
    throw new Error(LOCAL_MODE_ERROR.NO_MODELS_ENDPOINT);
  }
  const platformId = resolvePlatformIdFromApiKey(secret);
  const models = await fetchModelList(endpoint, secret.apiKey, { platformId });
  return { models, endpoint, key: secret };
}

export async function validateLocalModeBinding() {
  const config = getLocalModeConfig();
  if (!config.apiKeyId) {
    return { ok: false, reason: LOCAL_MODE_ERROR.NO_CONFIG };
  }

  let key;
  try {
    key = await fetchApiKeySecretById(config.apiKeyId);
  } catch (error) {
    return { ok: false, reason: LOCAL_MODE_ERROR.KEY_MISSING };
  }

  if (!isLocalModeKeyConfigured(key)) {
    return { ok: false, reason: LOCAL_MODE_ERROR.KEY_NOT_CONFIGURED, key };
  }

  const endpoint = resolveModelsEndpoint(key);
  if (!endpoint) {
    return { ok: false, reason: LOCAL_MODE_ERROR.NO_MODELS_ENDPOINT, key };
  }

  const chatModel = String(key.chatModel || '').trim();
  if (!chatModel) {
    if (isIntegratedPlatformId(key.platformId) && resolveChatModelId(key.platformId, '')) {
      return { ok: true, key, endpoint };
    }
    return { ok: false, reason: LOCAL_MODE_ERROR.NO_CHAT_MODEL, key };
  }

  if (isDefaultChatModelSentinel(chatModel)) {
    return { ok: true, key, endpoint };
  }

  try {
    const platformId = resolvePlatformIdFromApiKey(key);
    const models = await fetchModelList(endpoint, key.apiKey, { platformId });
    if (!isChatModelAvailable(models, chatModel)) {
      return {
        ok: false,
        reason: LOCAL_MODE_ERROR.MODEL_UNAVAILABLE,
        key,
        models,
        endpoint,
      };
    }
    return { ok: true, key, models, endpoint };
  } catch (error) {
    return { ok: false, reason: LOCAL_MODE_ERROR.FETCH_FAILED, key, endpoint, error };
  }
}

export async function tryEnableLocalMode() {
  const validation = await validateLocalModeBinding();
  if (validation.ok) {
    return { ok: true };
  }

  const needSetup = [
    LOCAL_MODE_ERROR.NO_CONFIG,
    LOCAL_MODE_ERROR.KEY_MISSING,
    LOCAL_MODE_ERROR.KEY_NOT_CONFIGURED,
    LOCAL_MODE_ERROR.NO_CHAT_MODEL,
    LOCAL_MODE_ERROR.NO_MODELS_ENDPOINT,
    LOCAL_MODE_ERROR.MODEL_UNAVAILABLE,
    LOCAL_MODE_ERROR.FETCH_FAILED,
  ].includes(validation.reason);

  return {
    ok: false,
    needSetup,
    ...validation,
  };
}

export async function saveLocalModeBinding(payload = {}) {
  const apiKeyId = String(payload.apiKeyId || '').trim();
  const chatModel = String(payload.chatModel || '').trim();
  const modelsEndpoint = String(payload.modelsEndpoint || '').trim();

  if (!apiKeyId) {
    throw new Error(LOCAL_MODE_ERROR.NO_CONFIG);
  }
  if (!chatModel) {
    throw new Error(LOCAL_MODE_ERROR.NO_CHAT_MODEL);
  }

  const patch = { chatModel };
  if (modelsEndpoint) {
    patch.modelsEndpoint = modelsEndpoint;
  }

  const updated = await patchApiKeyRecord(apiKeyId, patch);
  saveLocalModeConfig({ apiKeyId });

  const validation = await validateLocalModeBinding();
  if (!validation.ok) {
    throw new Error(validation.reason);
  }

  return updated;
}
