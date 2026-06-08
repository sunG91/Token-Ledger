/**
 * 本地向量记忆库常量
 */
export const VECTOR_MEMORY_PREFIX = 'vector_memory_';

/** 特征向量维度（本地哈希嵌入，三端纯 JS 兼容） */
export const VECTOR_EMBED_DIMENSION = 128;

/** 单次检索返回条数 */
export const VECTOR_MEMORY_TOP_K = 5;

/** 相似度阈值（低于此值不注入上下文） */
export const VECTOR_MEMORY_MIN_SCORE = 0.12;

/** 最大记忆条数 */
export const VECTOR_MEMORY_MAX_ENTRIES = 500;

/** 单条记忆文本最大字符数 */
export const VECTOR_MEMORY_MAX_TEXT_CHARS = 600;
