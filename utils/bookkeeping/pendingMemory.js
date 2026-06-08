/**
 * 口语记账待补全长记忆（结构化本地存储）
 */
import { BOOKKEEPING_PENDING_STATUS, BOOKKEEPING_STORAGE_PREFIX } from '@/constants/bookkeeping.js';
import { getCurrentUserId } from '@/utils/apiKeysStorage.js';
import { createMessageId } from '@/utils/chatMessage.js';
import { getStorageItem, setStorageItem } from '@/utils/storage.js';

function getPendingStorageKey(userId) {
  return `${BOOKKEEPING_STORAGE_PREFIX}${userId || getCurrentUserId()}`;
}

function createEmptyStore() {
  return {
    version: 1,
    pending: [],
    updatedAt: new Date().toISOString(),
  };
}

function normalizePendingEntry(raw = {}) {
  return {
    id: String(raw.id || createMessageId('bk-pending')),
    sessionId: String(raw.sessionId || ''),
    status: raw.status || BOOKKEEPING_PENDING_STATUS.AWAITING_TOKENS,
    platformId: String(raw.platformId || 'other'),
    platformName: String(raw.platformName || ''),
    modelName: String(raw.modelName || ''),
    modelSpecified: raw.modelSpecified === true || raw.model_specified === true,
    tokenCount: Number(raw.tokenCount) || 0,
    scenario: String(raw.scenario || ''),
    apiKeyId: String(raw.apiKeyId || ''),
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

export function loadPendingStore(userId) {
  const key = getPendingStorageKey(userId);
  const raw = getStorageItem(key, '');
  if (!raw) {
    return createEmptyStore();
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      version: Number(parsed.version) || 1,
      pending: Array.isArray(parsed.pending) ? parsed.pending.map(normalizePendingEntry) : [],
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    return createEmptyStore();
  }
}

function savePendingStore(store, userId) {
  const key = getPendingStorageKey(userId);
  const payload = {
    ...store,
    updatedAt: new Date().toISOString(),
  };
  setStorageItem(key, JSON.stringify(payload));
  return payload;
}

export function listIncompletePending(userId) {
  return loadPendingStore(userId).pending;
}

export function getPendingById(id, userId) {
  const targetId = String(id || '').trim();
  if (!targetId) {
    return null;
  }
  return loadPendingStore(userId).pending.find((item) => item.id === targetId) || null;
}

export function getActivePendingForSession(sessionId, userId) {
  const sid = String(sessionId || '').trim();
  if (!sid) {
    return null;
  }
  const list = loadPendingStore(userId).pending.filter((item) => item.sessionId === sid);
  if (!list.length) {
    return null;
  }
  return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
}

/** 保存或更新待补全记账；同 session 仅保留一条活跃待补记录 */
export function upsertPendingRecord(entry = {}, userId) {
  const next = normalizePendingEntry({
    ...entry,
    updatedAt: new Date().toISOString(),
  });
  const store = loadPendingStore(userId);
  const sessionId = next.sessionId;

  store.pending = store.pending.filter((item) => {
    if (sessionId && item.sessionId === sessionId) {
      return false;
    }
    return item.id !== next.id;
  });
  store.pending.unshift(next);
  savePendingStore(store, userId);
  return next;
}

/** 记账完成后删除对应长记忆 */
export function removePendingRecord(id, userId) {
  const targetId = String(id || '').trim();
  if (!targetId) {
    return false;
  }
  const store = loadPendingStore(userId);
  const before = store.pending.length;
  store.pending = store.pending.filter((item) => item.id !== targetId);
  if (store.pending.length === before) {
    return false;
  }
  savePendingStore(store, userId);
  return true;
}

/** 按会话删除待补全记录（记账完成时调用） */
export function removePendingForSession(sessionId, userId) {
  const sid = String(sessionId || '').trim();
  if (!sid) {
    return false;
  }
  const store = loadPendingStore(userId);
  const before = store.pending.length;
  store.pending = store.pending.filter((item) => item.sessionId !== sid);
  if (store.pending.length === before) {
    return false;
  }
  savePendingStore(store, userId);
  return true;
}

/** 记账成功后统一清理：优先按 id，否则按 session */
export function resolvePendingRecord({ pendingId = '', sessionId = '' } = {}, userId) {
  const removedById = removePendingRecord(pendingId, userId);
  if (removedById) {
    return true;
  }
  return removePendingForSession(sessionId, userId);
}
