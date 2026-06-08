import { CHAT_MAX_CONTEXT_CHARS } from '@/constants/chat.js';

function isContextMessage(message = {}) {
  if (message.excludeFromContext) {
    return false;
  }
  return message.type === 'text' && String(message.content || '').trim();
}

/**
 * 超出字数上限时，从最早的可参与上下文的消息开始清理
 */
export function pruneMessagesForContext(messages = [], maxChars = CHAT_MAX_CONTEXT_CHARS) {
  const eligible = messages.filter(isContextMessage);
  if (!eligible.length) {
    return [];
  }

  const pruned = [...eligible];
  let totalChars = pruned.reduce((sum, item) => sum + String(item.content).length, 0);

  while (totalChars > maxChars && pruned.length > 1) {
    const removed = pruned.shift();
    totalChars -= String(removed.content).length;
  }

  return pruned;
}

export function estimateContextChars(messages = []) {
  return pruneMessagesForContext(messages).reduce(
    (sum, item) => sum + String(item.content).length,
    0
  );
}
