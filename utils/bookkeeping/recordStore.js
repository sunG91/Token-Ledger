/**
 * 用户口语记账本地写入
 */
import {
  RECORD_SOURCE,
  RECORD_USAGE_SCOPE,
  USER_RECORDS_STORAGE_PREFIX,
} from '@/constants/bookkeeping.js';
import { getPlatform } from '@/constants/platforms.js';
import { getCurrentUserId } from '@/utils/apiKeysStorage.js';
import { createMessageId } from '@/utils/chatMessage.js';
import { estimateTokenCost } from '@/utils/assistant/costCalibrator.js';
import {
  formatRecordDisplayTime,
  getRecordDisplayModel,
  getRecordPlatformLabel,
  normalizeRecord,
} from '@/utils/recordDisplay.js';
import { getStorageItem, setStorageItem } from '@/utils/storage.js';
import { notifyMonthlyOverviewChanged } from '@/utils/monthlyOverviewEvents.js';

function getRecordStorageKey(userId) {
  return `${USER_RECORDS_STORAGE_PREFIX}${userId || getCurrentUserId()}`;
}

function loadRawRecords(userId) {
  const key = getRecordStorageKey(userId);
  const raw = getStorageItem(key, '[]');
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (error) {
    return [];
  }
}

export function toStoredRecord(record = {}) {
  const usageScope = record.usageScope || record.usage_scope || RECORD_USAGE_SCOPE.EXTERNAL;
  const modelSpecified =
    record.modelSpecified ??
    record.model_specified ??
    (usageScope === RECORD_USAGE_SCOPE.INTERNAL);
  return {
    id: record.id,
    platform_id: record.platformId,
    platform_name: record.platformName,
    model_name: record.modelName || '',
    model_specified: modelSpecified,
    token_count: record.tokenCount,
    cost_amount: record.costAmount,
    occurred_at: record.occurredAt,
    api_key_id: record.apiKeyId || '',
    source: record.source || RECORD_SOURCE.VOICE,
    usage_scope: usageScope,
    scenario: record.scenario || '',
  };
}

function saveRawRecords(list, userId) {
  const key = getRecordStorageKey(userId);
  return setStorageItem(key, JSON.stringify(Array.isArray(list) ? list : []));
}

export function listUserRecords(userId) {
  return loadRawRecords(userId).map(normalizeRecord);
}

export function createUserRecord({
  platformId = 'other',
  platformName = '',
  modelName = '',
  modelSpecified = false,
  tokenCount = 0,
  costAmount,
  scenario = '',
  apiKeyId = '',
  occurredAt = new Date().toISOString(),
  userId,
} = {}) {
  const explicitModel = modelSpecified ? String(modelName || '').trim() : '';
  const count = Number(tokenCount) || 0;
  const platform = getPlatform(platformId);
  const calibratedCost =
    costAmount !== undefined && costAmount !== null
      ? Number(costAmount)
      : estimateTokenCost({
          apiKeyId,
          modelName: explicitModel,
          platformId,
          tokenCount: count,
        }).costAmount;
  const record = normalizeRecord({
    id: createMessageId('user-record'),
    platform_id: platformId,
    platform_name: platformName || platform.name,
    model_name: explicitModel,
    model_specified: modelSpecified,
    token_count: count,
    cost_amount: Number(Number(calibratedCost).toFixed(4)),
    occurred_at: occurredAt,
    displayTime: formatRecordDisplayTime(occurredAt),
    scenario,
    api_key_id: apiKeyId,
    source: RECORD_SOURCE.VOICE,
    usage_scope: RECORD_USAGE_SCOPE.EXTERNAL,
  });

  const list = loadRawRecords(userId);
  list.unshift(toStoredRecord(record));
  const saved = saveRawRecords(list.slice(0, 500), userId);
  if (saved) {
    notifyMonthlyOverviewChanged();
  }

  return {
    ...record,
    saved,
  };
}

export function buildRecordCard(record = {}) {
  return {
    platformId: record.platformId,
    platformName: getRecordPlatformLabel(record),
    modelName: getRecordDisplayModel(record),
    tokenCount: record.tokenCount,
    costAmount: record.costAmount,
    occurredAt: record.occurredAt,
    status: 'success',
    scenario: record.scenario || '',
    usageScope: record.usageScope,
  };
}
