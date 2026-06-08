/**
 * API Key 本地仓储（H5 / iOS / Android 真实读写 storage）
 */
import { getPlatform } from '@/constants/platforms.js';
import {
  getDefaultIntegratedPlatformId,
  isIntegratedPlatformId,
} from '@/constants/integratedPlatforms.js';
import {
  API_KEY_CUSTOM_PLATFORM_ID,
  API_KEY_PROVIDER,
  API_KEY_STORAGE,
  generateApiKeyId,
  isCustomApiKey,
  isValidHttpUrl,
  maskApiKey,
  normalizeStorageType,
  sanitizeApiKeyForList,
} from '@/utils/apiKey.js';
import { API_KEY_ERROR, createApiKeyError } from '@/utils/apiKeyErrors.js';
import {
  encodePlatformLogo,
  isLegacyUploadedLogo,
  removeApiKeyLogo,
} from '@/utils/apiKeyLogo.js';
import { loadApiKeysFromStorage, saveApiKeysToStorage } from '@/utils/apiKeysStorage.js';
import { ensureDefaultUser } from '@/utils/auth.js';
import {
  getPlatformBalanceEndpoint,
  getPlatformChatEndpoint,
  getPlatformModelsEndpoint,
} from '@/constants/platformEndpoints.js';
import { getApiKeyNoExpiryValue } from '@/utils/apiKeyDisplay.js';

function isSupportedApiKey(item = {}) {
  return (
    isIntegratedPlatformId(item.platformId) ||
    item.platformId === API_KEY_CUSTOM_PLATFORM_ID ||
    isCustomApiKey(item)
  );
}

const LEGACY_DEFAULT_KEY_ID = 'ak_default_deepseek';
const LEGACY_DEMO_API_KEY = 'sk-demo-deepseek-local';

function normalizeApiKeyRecord(item = {}) {
  const record = {
    chatEndpoint: '',
    balanceEndpoint: '',
    modelsEndpoint: '',
    chatModel: '',
    logoUrl: '',
    cloudRecordId: '',
    providerType: item.providerType || API_KEY_PROVIDER.BUILTIN,
    ...item,
    storageType: normalizeStorageType(item.storageType, item.cloudSynced),
  };

  if (isCustomApiKey(record)) {
    record.platformId = API_KEY_CUSTOM_PLATFORM_ID;
    record.providerType = API_KEY_PROVIDER.CUSTOM;
    if (isLegacyUploadedLogo(record.logoUrl)) {
      removeApiKeyLogo(record.logoUrl);
      record.logoUrl = '';
    }
  }

  if (record.storageType === API_KEY_STORAGE.CLOUD && !record.cloudRecordId) {
    record.cloudRecordId = record.id;
  }

  if (record.expireDate === '长期有效') {
    record.expireDate = getApiKeyNoExpiryValue();
  }

  if (!isCustomApiKey(record) && isIntegratedPlatformId(record.platformId)) {
    if (!record.modelsEndpoint) {
      record.modelsEndpoint = getPlatformModelsEndpoint(record.platformId);
    }
    if (!record.balanceEndpoint) {
      record.balanceEndpoint = getPlatformBalanceEndpoint(record.platformId);
    }
  }

  return record;
}

function loadRawList() {
  ensureDefaultUser();
  return loadApiKeysFromStorage()
    .filter(isSupportedApiKey)
    .map(normalizeApiKeyRecord);
}

function isLegacySeedRecord(item = {}) {
  return item.id === LEGACY_DEFAULT_KEY_ID || item.apiKey === LEGACY_DEMO_API_KEY;
}

function purgeLegacySeed(list) {
  return list.filter((item) => !isLegacySeedRecord(item));
}

function persistList(list) {
  const saved = saveApiKeysToStorage(list);
  if (!saved) {
    throw createApiKeyError(API_KEY_ERROR.STORAGE_SAVE_FAILED);
  }
  return list;
}

function readListForDisplay() {
  const raw = loadRawList();
  const list = purgeLegacySeed(raw);
  if (list.length !== raw.length) {
    persistList(list);
  }
  return list;
}

function buildStorageType(payload = {}) {
  return payload.storageType === API_KEY_STORAGE.CLOUD
    ? API_KEY_STORAGE.CLOUD
    : API_KEY_STORAGE.LOCAL;
}

function buildCloudMeta(storageType, id) {
  if (storageType !== API_KEY_STORAGE.CLOUD) {
    return { cloudRecordId: '' };
  }
  return { cloudRecordId: id };
}

export function fetchApiKeyRecords() {
  return Promise.resolve(readListForDisplay().map(sanitizeApiKeyForList));
}

export function fetchApiKeyRecordById(id) {
  const item = readListForDisplay().find((entry) => entry.id === id);
  if (!item) {
    return Promise.reject(createApiKeyError(API_KEY_ERROR.NOT_FOUND));
  }
  return Promise.resolve(sanitizeApiKeyForList(item));
}

/** 内部使用：读取含明文 API Key 的记录（模型拉取 / 本地模式校验） */
export function fetchApiKeySecretById(id) {
  const item = loadRawList().find((entry) => entry.id === id);
  if (!item) {
    return Promise.reject(createApiKeyError(API_KEY_ERROR.NOT_FOUND));
  }
  return Promise.resolve(normalizeApiKeyRecord(item));
}

function createBuiltinRecord(payload = {}) {
  const apiKey = String(payload.apiKey || '').trim();
  if (!apiKey || apiKey.length < 8) {
    throw createApiKeyError(API_KEY_ERROR.KEY_REQUIRED);
  }

  const platformId = payload.platformId || getDefaultIntegratedPlatformId();
  if (!isIntegratedPlatformId(platformId)) {
    throw createApiKeyError(API_KEY_ERROR.NOT_FOUND);
  }

  const now = new Date().toISOString();
  const id = generateApiKeyId();
  const storageType = buildStorageType(payload);
  const platform = getPlatform(platformId);

  return {
    id,
    platformId,
    providerType: API_KEY_PROVIDER.BUILTIN,
    alias: String(payload.alias || '').trim() || platform.name,
    apiKey,
    maskedKey: maskApiKey(apiKey),
    officialBalance: null,
    balanceCurrency: 'CNY',
    expireDate: String(payload.expireDate || '').trim() || getApiKeyNoExpiryValue(),
    enabled: true,
    activated: false,
    storageType,
    ...buildCloudMeta(storageType, id),
    chatEndpoint: getPlatformChatEndpoint(platformId),
    balanceEndpoint: getPlatformBalanceEndpoint(platformId),
    modelsEndpoint: getPlatformModelsEndpoint(platformId),
    chatModel: String(payload.chatModel || '').trim(),
    logoUrl: '',
    createdAt: now,
    updatedAt: now,
  };
}

function createCustomRecord(payload = {}) {
  const apiKey = String(payload.apiKey || '').trim();
  const alias = String(payload.alias || '').trim();
  const chatEndpoint = String(payload.chatEndpoint || '').trim();
  const balanceEndpoint = String(payload.balanceEndpoint || '').trim();
  const modelsEndpoint = String(payload.modelsEndpoint || '').trim();

  if (!alias) {
    throw createApiKeyError(API_KEY_ERROR.NAME_REQUIRED);
  }
  if (!apiKey) {
    throw createApiKeyError(API_KEY_ERROR.KEY_REQUIRED);
  }
  if (!isValidHttpUrl(chatEndpoint)) {
    throw createApiKeyError(API_KEY_ERROR.INVALID_CHAT_ENDPOINT);
  }
  if (!isValidHttpUrl(balanceEndpoint)) {
    throw createApiKeyError(API_KEY_ERROR.INVALID_BALANCE_ENDPOINT);
  }
  if (!isValidHttpUrl(modelsEndpoint)) {
    throw createApiKeyError(API_KEY_ERROR.INVALID_MODELS_ENDPOINT);
  }

  const now = new Date().toISOString();
  const id = generateApiKeyId();
  const storageType = buildStorageType(payload);

  return {
    id,
    platformId: API_KEY_CUSTOM_PLATFORM_ID,
    providerType: API_KEY_PROVIDER.CUSTOM,
    alias,
    apiKey,
    maskedKey: maskApiKey(apiKey),
    officialBalance: null,
    balanceCurrency: 'CNY',
    expireDate: String(payload.expireDate || '').trim() || getApiKeyNoExpiryValue(),
    enabled: true,
    activated: false,
    storageType,
    ...buildCloudMeta(storageType, id),
    chatEndpoint,
    balanceEndpoint,
    modelsEndpoint,
    chatModel: String(payload.chatModel || '').trim(),
    logoUrl: encodePlatformLogo(payload.logoPlatformId || ''),
    createdAt: now,
    updatedAt: now,
  };
}

export function createApiKeyRecord(payload = {}) {
  try {
    const isCustom =
      payload.providerType === API_KEY_PROVIDER.CUSTOM ||
      payload.platformId === API_KEY_CUSTOM_PLATFORM_ID;

    const item = isCustom ? createCustomRecord(payload) : createBuiltinRecord(payload);
    const list = [item, ...readListForDisplay()];
    persistList(list);
    return Promise.resolve(sanitizeApiKeyForList(item));
  } catch (error) {
    return Promise.reject(error);
  }
}

export function patchApiKeyRecord(id, patch = {}) {
  const list = readListForDisplay();
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) {
    return Promise.reject(createApiKeyError(API_KEY_ERROR.NOT_FOUND));
  }

  const nextStorageType = patch.storageType || list[index].storageType;
  const nextId = list[index].id;

  list[index] = normalizeApiKeyRecord({
    ...list[index],
    ...patch,
    ...buildCloudMeta(nextStorageType, nextId),
    updatedAt: new Date().toISOString(),
  });

  persistList(list);
  return Promise.resolve(sanitizeApiKeyForList(list[index]));
}

async function removeCloudRecord(item) {
  // 账号体系接入后在此调用云端 DELETE；当前为本地模拟删除云端关联
  void item;
  return true;
}

/**
 * 删除 API Key
 * @param {string} id
 * @param {{ deleteLocal?: boolean, deleteCloud?: boolean }} options
 */
export async function deleteApiKeyRecord(id, options = {}) {
  const deleteLocal = options.deleteLocal !== false;
  const deleteCloud = options.deleteCloud === true;

  const list = readListForDisplay();
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) {
    throw createApiKeyError(API_KEY_ERROR.NOT_FOUND);
  }

  const target = list[index];
  const isCloudItem = target.storageType === API_KEY_STORAGE.CLOUD;

  if (isCloudItem && deleteCloud) {
    await removeCloudRecord(target);
  }

  if (isCloudItem && deleteCloud && !deleteLocal) {
    list[index] = normalizeApiKeyRecord({
      ...target,
      storageType: API_KEY_STORAGE.LOCAL,
      cloudRecordId: '',
      updatedAt: new Date().toISOString(),
    });
    persistList(list);
    return { mode: 'cloud_only', item: sanitizeApiKeyForList(list[index]) };
  }

  if (deleteLocal) {
    removeApiKeyLogo(target.logoUrl);
    const nextList = list.filter((item) => item.id !== id);
    persistList(nextList);
    return { mode: 'full' };
  }

  throw createApiKeyError(API_KEY_ERROR.NOT_FOUND);
}
