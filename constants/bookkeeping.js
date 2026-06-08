/**
 * 口语化记账常量
 */
export const BOOKKEEPING_STORAGE_PREFIX = 'bookkeeping_pending_';
export const USER_RECORDS_STORAGE_PREFIX = 'user_records_';

export const BOOKKEEPING_PENDING_STATUS = {
  AWAITING_MODEL: 'awaiting_model',
  AWAITING_TOKENS: 'awaiting_tokens',
};

export { ASSISTANT_TOOL_NAMES, BOOKKEEPING_TOOL_NAMES } from '@/constants/assistantTools.js';

export const BOOKKEEPING_DEFAULT_COST_RATE = 0.01;

/** 记录来源 */
export const RECORD_SOURCE = {
  CHAT: 'chat_assistant',
  VOICE: 'voice_bookkeeping',
};

/** 记录口径：内部=助手对话消耗，外部=用户口述记账 */
export const RECORD_USAGE_SCOPE = {
  INTERNAL: 'internal',
  EXTERNAL: 'external',
};
