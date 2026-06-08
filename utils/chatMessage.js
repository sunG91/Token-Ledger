/**
 * 聊天消息工具
 */
import dayjs from 'dayjs';
import { translate } from '@/i18n/index.js';

let messageSeed = 0;

/** 生成唯一消息 ID */
export function createMessageId(prefix = 'msg') {
  messageSeed += 1;
  return `${prefix}-${Date.now()}-${messageSeed}`;
}

/** 消息时间展示 HH:mm */
export function formatChatTime(date) {
  return dayjs(date).format('HH:mm');
}

/** 消息日期展示 MM-DD HH:mm */
export function formatChatDateTime(date) {
  return dayjs(date).format('MM-DD HH:mm');
}

/** 气泡右下角元信息：助手显示 token + 日期，用户仅日期 */
export function formatChatMessageMeta(message = {}, locale = 'zh-CN', options = {}) {
  const dateText = formatChatDateTime(message.createdAt || new Date());
  const tokenUsage = Number(message.tokenUsage) || 0;
  const showTokenUsage = options.showTokenUsage !== false;

  if (message.role === 'assistant' && showTokenUsage && tokenUsage > 0) {
    return translate(locale, 'assistant.messageMetaTokens', {
      tokens: tokenUsage,
      date: dateText,
    });
  }

  return dateText;
}

/** 创建文本消息 */
export function createTextMessage({
  role,
  content,
  reasoningContent = '',
  createdAt = new Date().toISOString(),
  showTime = true,
  excludeFromContext = false,
  tokenUsage = 0,
}) {
  const message = {
    id: createMessageId(role),
    role,
    type: 'text',
    content,
    createdAt,
    displayTime: showTime ? formatChatTime(createdAt) : '',
    excludeFromContext: !!excludeFromContext,
    tokenUsage: Number(tokenUsage) || 0,
  };
  if (reasoningContent) {
    message.reasoningContent = reasoningContent;
  }
  return message;
}

/** 创建图片消息 */
export function createImageMessage({
  imagePath,
  role = 'user',
  createdAt = new Date().toISOString(),
}) {
  return {
    id: createMessageId('image'),
    role,
    type: 'image',
    imagePath,
    createdAt,
    displayTime: formatChatTime(createdAt),
  };
}

/** 从 UI 消息列表构建 Chat Completions messages */
export function buildChatCompletionMessages(messages = []) {
  return messages
    .filter(
      (item) =>
        item.type === 'text' && String(item.content || '').trim() && !item.excludeFromContext
    )
    .map((item) => ({
      role: item.role,
      content: String(item.content).trim(),
    }));
}

export function createCardMessage({
  role = 'assistant',
  type,
  card,
  createdAt = new Date().toISOString(),
}) {
  return {
    id: createMessageId('card'),
    role,
    type,
    card,
    createdAt,
    displayTime: formatChatTime(createdAt),
  };
}
