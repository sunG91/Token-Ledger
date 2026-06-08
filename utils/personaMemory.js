/**
 * 人设持久记忆：对话写入与历史重建
 */
import { createMessageId } from '@/utils/chatMessage.js';
import { loadChatStore } from '@/utils/chatStorage.js';
import { isPersonaMemoryEnabled } from '@/utils/personaConfig.js';
import {
  clearVectorMemoryStore,
  listVectorMemoryEntries,
  upsertVectorMemoryEntry,
} from '@/utils/vectorMemory.js';

const MEMORY_TURN_MAX_CHARS = 480;

function buildTurnMemoryText(userText = '', assistantText = '') {
  const user = String(userText || '').trim();
  const assistant = String(assistantText || '').trim();
  if (!user && !assistant) {
    return '';
  }

  const text = `用户：${user}\n助手：${assistant}`;
  return text.slice(0, MEMORY_TURN_MAX_CHARS);
}

function extractMemoryPairs(messages = []) {
  const pairs = [];
  let pendingUser = '';

  messages.forEach((message) => {
    if (message.type !== 'text' || message.excludeFromContext) {
      return;
    }
    const content = String(message.content || '').trim();
    if (!content) {
      return;
    }

    if (message.role === 'user') {
      pendingUser = content;
      return;
    }

    if (message.role === 'assistant' && pendingUser) {
      pairs.push({
        userText: pendingUser,
        assistantText: content,
      });
      pendingUser = '';
    }
  });

  return pairs;
}

/** 单轮对话结束后写入记忆 */
export function captureTurnMemory({
  userText = '',
  assistantText = '',
  sessionId = '',
  userId,
} = {}) {
  if (!isPersonaMemoryEnabled()) {
    return null;
  }

  const text = buildTurnMemoryText(userText, assistantText);
  if (!text) {
    return null;
  }

  return upsertVectorMemoryEntry({
    id: createMessageId('mem'),
    text,
    sessionId,
    source: 'chat',
    userId,
  });
}

/** 从本地聊天历史重建向量库（不清理已有非历史来源条目） */
export function rebuildVectorMemoryFromChatHistory({ userId, replaceHistory = true } = {}) {
  const store = loadChatStore(userId);
  const existing = listVectorMemoryEntries(userId);
  const preserved = replaceHistory
    ? existing.filter((item) => item.source !== 'history')
    : existing;

  const pairs = [];
  Object.keys(store.messagesBySession || {}).forEach((sessionId) => {
    const messages = store.messagesBySession[sessionId] || [];
    extractMemoryPairs(messages).forEach((pair) => {
      pairs.push({
        ...pair,
        sessionId,
      });
    });
  });

  if (replaceHistory) {
    clearVectorMemoryStore(userId);
    preserved.forEach((entry) => {
      upsertVectorMemoryEntry({
        id: entry.id,
        text: entry.text,
        sessionId: entry.sessionId,
        source: entry.source,
        userId,
      });
    });
  }

  pairs.forEach((pair, index) => {
    const text = buildTurnMemoryText(pair.userText, pair.assistantText);
    if (!text) {
      return;
    }
    upsertVectorMemoryEntry({
      id: `history-${pair.sessionId}-${index}`,
      text,
      sessionId: pair.sessionId,
      source: 'history',
      userId,
    });
  });

  return pairs.length;
}
