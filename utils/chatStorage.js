/**
 * 本地聊天会话与消息持久化
 */
import {
  CHAT_MAX_SESSION_COUNT,
  CHAT_SESSION_TITLE_MAX,
  CHAT_STORAGE_PREFIX,
} from '@/constants/chat.js';
import { getCurrentUserId } from '@/utils/apiKeysStorage.js';
import { getStorageItem, setStorageItem } from '@/utils/storage.js';
import { createMessageId } from '@/utils/chatMessage.js';

function getChatStorageKey(userId) {
  return `${CHAT_STORAGE_PREFIX}${userId || getCurrentUserId()}`;
}

function createEmptyStore() {
  return {
    activeSessionId: '',
    sessions: [],
    messagesBySession: {},
  };
}

function normalizeStore(raw = {}) {
  const store = {
    activeSessionId: String(raw.activeSessionId || '').trim(),
    sessions: Array.isArray(raw.sessions) ? raw.sessions : [],
    messagesBySession:
      raw.messagesBySession && typeof raw.messagesBySession === 'object'
        ? raw.messagesBySession
        : {},
  };

  store.sessions = store.sessions
    .filter((item) => item && item.id)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return store;
}

export function loadChatStore(userId) {
  const key = getChatStorageKey(userId);
  const raw = getStorageItem(key, '');
  if (!raw) {
    return createEmptyStore();
  }
  try {
    return normalizeStore(JSON.parse(raw));
  } catch (error) {
    return createEmptyStore();
  }
}

function persistChatStore(store, userId) {
  const key = getChatStorageKey(userId);
  try {
    const payload = JSON.stringify(store);
    const saved = setStorageItem(key, payload);
    return { ok: saved, key, size: payload.length };
  } catch (error) {
    return { ok: false, key, error };
  }
}

export function createSessionId() {
  return createMessageId('session');
}

export function deriveSessionTitle(messages = []) {
  const firstUser = messages.find(
    (item) => item.role === 'user' && item.type === 'text' && String(item.content || '').trim()
  );
  if (!firstUser) {
    return '';
  }
  const text = String(firstUser.content).trim().replace(/\s+/g, ' ');
  if (text.length <= CHAT_SESSION_TITLE_MAX) {
    return text;
  }
  return `${text.slice(0, CHAT_SESSION_TITLE_MAX)}…`;
}

export function listChatSessions(userId) {
  return loadChatStore(userId).sessions;
}

export function getActiveSessionId(userId) {
  return loadChatStore(userId).activeSessionId;
}

export function getSessionMessages(sessionId, userId) {
  const store = loadChatStore(userId);
  return Array.isArray(store.messagesBySession[sessionId])
    ? store.messagesBySession[sessionId]
    : [];
}

export function setActiveSession(sessionId, userId) {
  const store = loadChatStore(userId);
  store.activeSessionId = String(sessionId || '').trim();
  persistChatStore(store, userId);
  return store.activeSessionId;
}

export function createChatSession({ apiKeyId = '', title = '' } = {}, userId) {
  const store = loadChatStore(userId);
  const now = new Date().toISOString();
  const session = {
    id: createSessionId(),
    title: String(title || '').trim(),
    apiKeyId: String(apiKeyId || '').trim(),
    createdAt: now,
    updatedAt: now,
    totalTokens: 0,
    messageCount: 0,
  };

  store.sessions.unshift(session);
  store.messagesBySession[session.id] = [];
  store.activeSessionId = session.id;

  if (store.sessions.length > CHAT_MAX_SESSION_COUNT) {
    const removed = store.sessions.splice(CHAT_MAX_SESSION_COUNT);
    removed.forEach((item) => {
      delete store.messagesBySession[item.id];
      if (store.activeSessionId === item.id) {
        store.activeSessionId = store.sessions[0]?.id || '';
      }
    });
  }

  persistChatStore(store, userId);
  return session;
}

export function saveSessionMessages(sessionId, messages = [], userId) {
  const id = String(sessionId || '').trim();
  if (!id) {
    return false;
  }

  const store = loadChatStore(userId);
  store.messagesBySession[id] = Array.isArray(messages) ? messages : [];

  const index = store.sessions.findIndex((item) => item.id === id);
  if (index >= 0) {
    const title = deriveSessionTitle(store.messagesBySession[id]);
    const totalTokens = store.messagesBySession[id].reduce(
      (sum, item) => sum + (Number(item.tokenUsage) || 0),
      0
    );
    store.sessions[index] = {
      ...store.sessions[index],
      title: title || store.sessions[index].title,
      updatedAt: new Date().toISOString(),
      messageCount: store.messagesBySession[id].length,
      totalTokens,
    };
    const [updated] = store.sessions.splice(index, 1);
    store.sessions.unshift(updated);
  }

  const result = persistChatStore(store, userId);
  return result.ok;
}

export function getChatStorageMeta(userId) {
  const key = getChatStorageKey(userId);
  const raw = getStorageItem(key, '');
  return {
    key,
    exists: !!raw,
    size: raw ? String(raw).length : 0,
  };
}

export function updateSessionMeta(sessionId, patch = {}, userId) {
  const id = String(sessionId || '').trim();
  if (!id) {
    return null;
  }

  const store = loadChatStore(userId);
  const index = store.sessions.findIndex((item) => item.id === id);
  if (index < 0) {
    return null;
  }

  store.sessions[index] = {
    ...store.sessions[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  persistChatStore(store, userId);
  return store.sessions[index];
}

export function deleteChatSession(sessionId, userId) {
  const id = String(sessionId || '').trim();
  if (!id) {
    return false;
  }

  const store = loadChatStore(userId);
  store.sessions = store.sessions.filter((item) => item.id !== id);
  delete store.messagesBySession[id];

  if (store.activeSessionId === id) {
    store.activeSessionId = store.sessions[0]?.id || '';
  }

  persistChatStore(store, userId);
  return true;
}

export function ensureChatSession({ apiKeyId = '' } = {}, userId) {
  const store = loadChatStore(userId);
  if (store.activeSessionId && store.sessions.some((item) => item.id === store.activeSessionId)) {
    return store.sessions.find((item) => item.id === store.activeSessionId);
  }

  if (store.sessions.length) {
    store.activeSessionId = store.sessions[0].id;
    persistChatStore(store, userId);
    return store.sessions[0];
  }

  return createChatSession({ apiKeyId }, userId);
}
