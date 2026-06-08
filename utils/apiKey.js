/** 默认官方平台（与 integratedPlatforms 首项保持一致） */
export const API_KEY_PLATFORM_ID = 'deepseek';

/** 用户自定义接口平台 */
export const API_KEY_CUSTOM_PLATFORM_ID = 'custom';

export const API_KEY_PROVIDER = {
  BUILTIN: 'builtin',
  CUSTOM: 'custom',
};

/** API Key 存储位置 */
export const API_KEY_STORAGE = {
  LOCAL: 'local',
  CLOUD: 'cloud',
};

export function isCustomApiKey(item = {}) {
  return (
    item.providerType === API_KEY_PROVIDER.CUSTOM ||
    item.platformId === API_KEY_CUSTOM_PLATFORM_ID
  );
}

export function isBuiltinApiKey(item = {}) {
  return item.providerType === API_KEY_PROVIDER.BUILTIN && !isCustomApiKey(item);
}

export function isValidHttpUrl(value = '') {
  const trimmed = String(value).trim();
  if (!trimmed) {
    return false;
  }
  return /^https?:\/\/.+/i.test(trimmed);
}

export function normalizeStorageType(value, legacyCloudSynced) {
  if (value === API_KEY_STORAGE.CLOUD || value === API_KEY_STORAGE.LOCAL) {
    return value;
  }
  return legacyCloudSynced ? API_KEY_STORAGE.CLOUD : API_KEY_STORAGE.LOCAL;
}

export function maskApiKey(key = '') {
  const trimmed = String(key).trim();
  if (!trimmed) {
    return 'sk-****';
  }
  if (trimmed.length <= 6) {
    return 'sk-****';
  }
  const prefix = trimmed.startsWith('sk-') ? 'sk-' : '';
  const tail = trimmed.slice(-4);
  return `${prefix}***${tail}`;
}

export function generateApiKeyId() {
  return `ak_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function sanitizeApiKeyForList(item = {}) {
  const { apiKey, ...rest } = item;
  return { ...rest };
}

export function isCloudApiKey(item = {}) {
  return item.storageType === API_KEY_STORAGE.CLOUD;
}
