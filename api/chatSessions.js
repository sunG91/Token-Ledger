/**
 * 本地聊天会话 API
 */
import { getWelcomeMessages } from '@/constants/mock/assistant.js';
import { getLocale } from '@/utils/settings.js';
import {
  computeMessageWindow,
  loadOlderMessageWindow,
  sliceVisibleMessages,
} from '@/utils/chatMessageWindow.js';
import {
  createChatSession,
  deleteChatSession,
  ensureChatSession,
  getSessionMessages,
  listChatSessions,
  loadChatStore,
  saveSessionMessages,
  setActiveSession,
} from '@/utils/chatStorage.js';

function buildSessionView(sessionId, allMessages = []) {
  const windowState = computeMessageWindow(allMessages);
  return {
    sessionId,
    allMessages,
    items: sliceVisibleMessages(allMessages, windowState.firstLoadedIndex),
    firstLoadedIndex: windowState.firstLoadedIndex,
    hasMore: windowState.hasMore,
    total: allMessages.length,
    totalRounds: windowState.totalRounds,
  };
}

export function fetchChatSessions() {
  return Promise.resolve(listChatSessions());
}

export function fetchSessionMessages(sessionId) {
  const allMessages = getSessionMessages(sessionId);
  const view = buildSessionView(sessionId, allMessages);
  return Promise.resolve({
    items: view.items,
    allMessages: view.allMessages,
    firstLoadedIndex: view.firstLoadedIndex,
    hasMore: view.hasMore,
    total: view.total,
  });
}

export function loadOlderSessionMessages(sessionId, firstLoadedIndex = 0) {
  const allMessages = getSessionMessages(sessionId);
  const anchorId = allMessages[firstLoadedIndex]?.id || '';
  const older = loadOlderMessageWindow(allMessages, firstLoadedIndex);
  return Promise.resolve({
    sessionId,
    allMessages,
    items: sliceVisibleMessages(allMessages, older.firstLoadedIndex),
    firstLoadedIndex: older.firstLoadedIndex,
    hasMore: older.hasMore,
    anchorId,
    loaded: older.loaded,
    total: allMessages.length,
  });
}

export function resolveInitialChatState({ apiKeyId = '' } = {}) {
  const session = ensureChatSession({ apiKeyId });
  let allMessages = getSessionMessages(session.id);

  if (!allMessages.length) {
    allMessages = getWelcomeMessages(getLocale());
    saveSessionMessages(session.id, allMessages);
  }

  return buildSessionView(session.id, allMessages);
}

export function startNewChatSession({ apiKeyId = '' } = {}) {
  const session = createChatSession({ apiKeyId });
  const welcome = getWelcomeMessages(getLocale());
  saveSessionMessages(session.id, welcome);
  setActiveSession(session.id);
  const view = buildSessionView(session.id, welcome);
  return {
    ...view,
    sessions: listChatSessions(),
  };
}

export function switchChatSession(sessionId) {
  const id = String(sessionId || '').trim();
  setActiveSession(id);
  const allMessages = getSessionMessages(id);
  return {
    ...buildSessionView(id, allMessages),
    sessions: listChatSessions(),
  };
}

export function removeChatSession(sessionId) {
  deleteChatSession(sessionId);
  const store = loadChatStore();
  const activeId = store.activeSessionId;
  const allMessages = activeId ? getSessionMessages(activeId) : [];
  return {
    ...(activeId
      ? buildSessionView(activeId, allMessages)
      : {
          sessionId: '',
          allMessages: [],
          items: [],
          firstLoadedIndex: 0,
          hasMore: false,
          total: 0,
        }),
    sessions: listChatSessions(),
  };
}

export function persistChatMessages(sessionId, allMessages = []) {
  const ok = saveSessionMessages(sessionId, allMessages);
  return {
    ok,
    sessions: listChatSessions(),
  };
}
