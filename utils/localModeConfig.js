import { SETTINGS_STORAGE_KEYS } from '@/constants/settings.js';
import { resolveModelsEndpoint } from '@/utils/apiKeyEndpoints.js';
import { isCustomApiKey, isValidHttpUrl } from '@/utils/apiKey.js';
import { getStorageItem, setStorageItem } from '@/utils/storage.js';
import { isIntegratedPlatformId } from '@/constants/integratedPlatforms.js';
import { resolveChatModelId } from '@/constants/platformChatModels.js';

export { resolveModelsEndpoint };

export function getLocalModeConfig() {
  const raw = getStorageItem(SETTINGS_STORAGE_KEYS.LOCAL_MODE, '{}');
  try {
    const parsed = JSON.parse(raw);
    return {
      apiKeyId: String(parsed?.apiKeyId || '').trim(),
    };
  } catch (error) {
    return { apiKeyId: '' };
  }
}

export function saveLocalModeConfig(config = {}) {
  const next = {
    apiKeyId: String(config.apiKeyId || '').trim(),
  };
  setStorageItem(SETTINGS_STORAGE_KEYS.LOCAL_MODE, JSON.stringify(next));
  return next;
}

export function clearLocalModeConfig() {
  setStorageItem(SETTINGS_STORAGE_KEYS.LOCAL_MODE, JSON.stringify({ apiKeyId: '' }));
}

export function isLocalModeKeyConfigured(key = {}) {
  if (!key?.id || key.enabled === false) {
    return false;
  }
  if (!String(key.apiKey || '').trim()) {
    return false;
  }
  const chatModel = String(key.chatModel || '').trim();
  if (!chatModel) {
    if (isIntegratedPlatformId(key.platformId) && resolveChatModelId(key.platformId, '')) {
      // 官方平台可使用内置默认对话模型
    } else {
      return false;
    }
  }
  const endpoint = resolveModelsEndpoint(key);
  return isCustomApiKey(key) ? isValidHttpUrl(endpoint) : !!endpoint;
}
