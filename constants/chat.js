/** 多轮对话上下文最大字符数（超出后从最早记录开始清理） */
export const CHAT_MAX_CONTEXT_CHARS = 28000;

/** 本地最多保留会话数 */
export const CHAT_MAX_SESSION_COUNT = 80;

/** 会话标题最大长度 */
export const CHAT_SESSION_TITLE_MAX = 24;

export const CHAT_STORAGE_PREFIX = 'chat_store_';

/** 打开会话时默认展示最近几轮对话（1 轮 = 用户一问 + 助手一答） */
export const CHAT_INITIAL_ROUNDS = 3;

/** 上滑每次追加加载几轮 */
export const CHAT_LOAD_MORE_ROUNDS = 3;

/** 历史抽屉每次展示/加载几个会话 */
export const CHAT_SESSION_PAGE_SIZE = 15;
