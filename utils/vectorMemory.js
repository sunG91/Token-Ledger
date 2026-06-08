/**
 * 本地向量记忆库（按用户分区存储）
 */
import {
  VECTOR_EMBED_DIMENSION,
  VECTOR_MEMORY_MAX_ENTRIES,
  VECTOR_MEMORY_MAX_TEXT_CHARS,
  VECTOR_MEMORY_MIN_SCORE,
  VECTOR_MEMORY_PREFIX,
  VECTOR_MEMORY_TOP_K,
} from '@/constants/vectorMemory.js';
import { getCurrentUserId } from '@/utils/apiKeysStorage.js';
import { cosineSimilarity, embedTextLocally } from '@/utils/localEmbedding.js';
import { getStorageItem, setStorageItem } from '@/utils/storage.js';

function getVectorMemoryKey(userId) {
  return `${VECTOR_MEMORY_PREFIX}${userId || getCurrentUserId()}`;
}

function createEmptyStore() {
  return {
    version: 1,
    dimension: VECTOR_EMBED_DIMENSION,
    entries: [],
    updatedAt: new Date().toISOString(),
  };
}

function normalizeStore(raw = {}) {
  const store = {
    version: Number(raw.version) || 1,
    dimension: Number(raw.dimension) || VECTOR_EMBED_DIMENSION,
    entries: Array.isArray(raw.entries) ? raw.entries : [],
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };

  store.entries = store.entries
    .filter((item) => item && item.id && item.text)
    .map((item) => ({
      id: String(item.id),
      text: String(item.text).slice(0, VECTOR_MEMORY_MAX_TEXT_CHARS),
      embedding: Array.isArray(item.embedding) ? item.embedding : [],
      sessionId: String(item.sessionId || ''),
      source: String(item.source || 'chat'),
      createdAt: item.createdAt || new Date().toISOString(),
    }));

  return store;
}

export function loadVectorMemoryStore(userId) {
  const key = getVectorMemoryKey(userId);
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

function saveVectorMemoryStore(store, userId) {
  const key = getVectorMemoryKey(userId);
  const payload = {
    ...store,
    updatedAt: new Date().toISOString(),
  };
  setStorageItem(key, JSON.stringify(payload));
  return payload;
}

export function getVectorMemoryStats(userId) {
  const store = loadVectorMemoryStore(userId);
  const serialized = JSON.stringify(store);
  const bytes = typeof serialized === 'string' ? serialized.length : 0;
  return {
    entryCount: store.entries.length,
    bytes,
    dimension: store.dimension,
    updatedAt: store.updatedAt,
  };
}

export function formatVectorMemorySize(bytes = 0) {
  const value = Number(bytes) || 0;
  if (value < 1024) {
    return `${value} B`;
  }
  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

export function clearVectorMemoryStore(userId) {
  saveVectorMemoryStore(createEmptyStore(), userId);
}

export function upsertVectorMemoryEntry({
  id,
  text,
  sessionId = '',
  source = 'chat',
  userId,
} = {}) {
  const content = String(text || '').trim();
  if (!content) {
    return null;
  }

  const store = loadVectorMemoryStore(userId);
  const entryId = String(id || `mem-${Date.now()}`);
  const embedding = embedTextLocally(content, store.dimension);
  const nextEntry = {
    id: entryId,
    text: content.slice(0, VECTOR_MEMORY_MAX_TEXT_CHARS),
    embedding,
    sessionId: String(sessionId || ''),
    source,
    createdAt: new Date().toISOString(),
  };

  const existingIndex = store.entries.findIndex((item) => item.id === entryId);
  if (existingIndex >= 0) {
    store.entries.splice(existingIndex, 1, nextEntry);
  } else {
    store.entries.unshift(nextEntry);
  }

  if (store.entries.length > VECTOR_MEMORY_MAX_ENTRIES) {
    store.entries = store.entries.slice(0, VECTOR_MEMORY_MAX_ENTRIES);
  }

  saveVectorMemoryStore(store, userId);
  return nextEntry;
}

export function searchVectorMemory({
  query = '',
  topK = VECTOR_MEMORY_TOP_K,
  minScore = VECTOR_MEMORY_MIN_SCORE,
  userId,
} = {}) {
  const content = String(query || '').trim();
  if (!content) {
    return [];
  }

  const store = loadVectorMemoryStore(userId);
  const queryVector = embedTextLocally(content, store.dimension);

  return store.entries
    .map((entry) => ({
      ...entry,
      score: cosineSimilarity(queryVector, entry.embedding),
    }))
    .filter((item) => item.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export function listVectorMemoryEntries(userId) {
  return loadVectorMemoryStore(userId).entries;
}
