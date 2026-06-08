/**
 * 助手对话 Token 消耗：按天累计，时间为当日最后一次对话
 */
import dayjs from 'dayjs';
import { getPlatform } from '@/constants/platforms.js';
import { createMessageId } from '@/utils/chatMessage.js';
import { formatRecordDisplayTime, normalizeRecord } from '@/utils/recordDisplay.js';
import { toStoredRecord } from '@/utils/bookkeeping/recordStore.js';
import { notifyMonthlyOverviewChanged } from '@/utils/monthlyOverviewEvents.js';
import {
  RECORD_SOURCE,
  RECORD_USAGE_SCOPE,
  USER_RECORDS_STORAGE_PREFIX,
} from '@/constants/bookkeeping.js';
import { getCurrentUserId } from '@/utils/apiKeysStorage.js';
import { getStorageItem, setStorageItem } from '@/utils/storage.js';

export const CHAT_USAGE_SOURCE = RECORD_SOURCE.CHAT;

function getRecordStorageKey(userId) {
  return `${USER_RECORDS_STORAGE_PREFIX}${userId || getCurrentUserId()}`;
}

function loadRawRecords(userId) {
  const raw = getStorageItem(getRecordStorageKey(userId), '[]');
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (error) {
    return [];
  }
}

function saveRawRecords(list, userId) {
  setStorageItem(getRecordStorageKey(userId), JSON.stringify(Array.isArray(list) ? list : []));
}

function isSameChatDayRecord(record, { apiKeyId, modelName, dayKey }) {
  if (String(record.source) !== CHAT_USAGE_SOURCE) {
    return false;
  }
  if (String(record.api_key_id || record.apiKeyId) !== String(apiKeyId)) {
    return false;
  }
  if (String(record.model_name || record.modelName) !== String(modelName)) {
    return false;
  }
  const occurredAt = record.occurred_at || record.occurredAt;
  return dayjs(occurredAt).format('YYYY-MM-DD') === dayKey;
}

/**
 * 累计写入当日对话消耗（同 Key + 模型 + 日期合并为一条）
 */
export function upsertDailyChatUsage({
  apiKeyId = '',
  platformId = 'other',
  platformName = '',
  modelName = '',
  tokenCount = 0,
  occurredAt,
  userId,
} = {}) {
  const count = Number(tokenCount) || 0;
  const keyId = String(apiKeyId || '').trim();
  const resolvedModel = String(modelName || 'unknown').trim() || 'unknown';
  if (!keyId || count <= 0) {
    return null;
  }

  const nowIso = occurredAt || new Date().toISOString();
  const dayKey = dayjs(nowIso).format('YYYY-MM-DD');
  const platform = getPlatform(platformId);
  const list = loadRawRecords(userId);
  const index = list.findIndex((item) =>
    isSameChatDayRecord(item, { apiKeyId: keyId, modelName: resolvedModel, dayKey })
  );

  let record;
  if (index >= 0) {
    const current = normalizeRecord(list[index]);
    record = normalizeRecord({
      ...list[index],
      token_count: (Number(current.tokenCount) || 0) + count,
      occurred_at: nowIso,
      displayTime: formatRecordDisplayTime(nowIso),
      source: CHAT_USAGE_SOURCE,
      usage_scope: RECORD_USAGE_SCOPE.INTERNAL,
    });
    list[index] = toStoredRecord(record);
  } else {
    record = normalizeRecord({
      id: createMessageId('chat-usage'),
      platform_id: platformId,
      platform_name: platformName || platform.name,
      model_name: resolvedModel,
      token_count: count,
      occurred_at: nowIso,
      displayTime: formatRecordDisplayTime(nowIso),
      api_key_id: keyId,
      source: CHAT_USAGE_SOURCE,
      usage_scope: RECORD_USAGE_SCOPE.INTERNAL,
      scenario: '助手对话',
    });
    list.unshift(toStoredRecord(record));
  }

  saveRawRecords(list.slice(0, 500), userId);
  notifyMonthlyOverviewChanged();
  return record;
}
