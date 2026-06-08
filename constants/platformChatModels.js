/**
 * 各官方平台默认对话模型
 * @see https://api-docs.deepseek.com/zh-cn/api/create-chat-completion
 */
import { DEEPSEEK_PLATFORM_ID } from '@/constants/platformErrors/deepseek.js';

/** 选择「官方默认」时写入 chatModel 的哨兵值 */
export const DEFAULT_CHAT_MODEL_SENTINEL = '__platform_default__';

export const PLATFORM_DEFAULT_CHAT_MODELS = {
  [DEEPSEEK_PLATFORM_ID]: 'deepseek-chat',
};

export function getPlatformDefaultChatModel(platformId = '') {
  return PLATFORM_DEFAULT_CHAT_MODELS[platformId] || '';
}

export function isDefaultChatModelSentinel(chatModel = '') {
  return String(chatModel || '').trim() === DEFAULT_CHAT_MODEL_SENTINEL;
}

/**
 * 将存储的 chatModel 解析为实际请求用的模型 id
 */
export function resolveChatModelId(platformId = '', chatModel = '') {
  const raw = String(chatModel || '').trim();
  if (!raw || isDefaultChatModelSentinel(raw)) {
    return getPlatformDefaultChatModel(platformId) || raw;
  }
  return raw;
}
