/**
 * 模型金额换算配置本地存储（三端 uni.storage）
 */
import {
  COST_CALIBRATION_MAX_SAMPLES,
  COST_CALIBRATION_STORAGE_PREFIX,
} from '@/constants/costCalibration.js';
import { getCurrentUserId } from '@/utils/apiKeysStorage.js';
import { getStorageItem, setStorageItem } from '@/utils/storage.js';

function getStoreKey(userId) {
  return `${COST_CALIBRATION_STORAGE_PREFIX}${userId || getCurrentUserId()}`;
}

function buildProfileKey(apiKeyId = '', modelName = '') {
  return `${String(apiKeyId || '').trim()}::${String(modelName || '')
    .trim()
    .toLowerCase()}`;
}

function createEmptyStore() {
  return {
    version: 1,
    profiles: {},
    updatedAt: new Date().toISOString(),
  };
}

function normalizeSample(raw = {}) {
  return {
    tokens: Number(raw.tokens) || 0,
    costDelta: Number(raw.costDelta) || 0,
    costPerToken: Number(raw.costPerToken) || 0,
    pendingBefore: Number(raw.pendingBefore) || 0,
    observedAt: raw.observedAt || new Date().toISOString(),
  };
}

function normalizeProfile(raw = {}, fallbackKey = '') {
  const key = String(raw.key || fallbackKey || '').trim();
  const parts = key.split('::');
  return {
    key,
    apiKeyId: String(raw.apiKeyId || parts[0] || '').trim(),
    platformId: String(raw.platformId || '').trim(),
    modelName: String(raw.modelName || parts[1] || '').trim(),
    balanceCurrency: String(raw.balanceCurrency || 'CNY').toUpperCase(),
    pendingTokens: Number(raw.pendingTokens) || 0,
    lastBalance:
      raw.lastBalance === null || raw.lastBalance === undefined ? null : Number(raw.lastBalance),
    costPerToken:
      raw.costPerToken === null || raw.costPerToken === undefined ? null : Number(raw.costPerToken),
    sampleCount: Number(raw.sampleCount) || 0,
    samples: Array.isArray(raw.samples) ? raw.samples.map(normalizeSample) : [],
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

export function loadCostCalibrationStore(userId) {
  const raw = getStorageItem(getStoreKey(userId), '');
  if (!raw) {
    return createEmptyStore();
  }
  try {
    const parsed = JSON.parse(raw);
    const profiles = {};
    const source = parsed.profiles && typeof parsed.profiles === 'object' ? parsed.profiles : {};
    Object.keys(source).forEach((profileKey) => {
      profiles[profileKey] = normalizeProfile(source[profileKey], profileKey);
    });
    return {
      version: Number(parsed.version) || 1,
      profiles,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    return createEmptyStore();
  }
}

function saveCostCalibrationStore(store, userId) {
  const payload = {
    ...store,
    updatedAt: new Date().toISOString(),
  };
  setStorageItem(getStoreKey(userId), JSON.stringify(payload));
  return payload;
}

export function listCostCalibrationProfiles(userId) {
  const store = loadCostCalibrationStore(userId);
  return Object.values(store.profiles);
}

export function getCostCalibrationProfile(apiKeyId = '', modelName = '', userId) {
  const key = buildProfileKey(apiKeyId, modelName);
  if (!key || key === '::') {
    return null;
  }
  const store = loadCostCalibrationStore(userId);
  return store.profiles[key] || null;
}

export function upsertCostCalibrationProfile(profile = {}, userId) {
  const key = buildProfileKey(profile.apiKeyId, profile.modelName);
  if (!key || key === '::') {
    return null;
  }
  const store = loadCostCalibrationStore(userId);
  const next = normalizeProfile(
    {
      ...profile,
      key,
      samples: (profile.samples || []).slice(0, COST_CALIBRATION_MAX_SAMPLES),
    },
    key
  );
  store.profiles[key] = next;
  saveCostCalibrationStore(store, userId);
  return next;
}

export function buildCalibrationProfileKey(apiKeyId, modelName) {
  return buildProfileKey(apiKeyId, modelName);
}
