/**
 * 本地文本向量化（哈希 n-gram，Web / iOS / Android 纯 JS 兼容）
 */
import { VECTOR_EMBED_DIMENSION } from '@/constants/vectorMemory.js';

function hashToken(token, dimension) {
  let hash = 2166136261;
  for (let i = 0; i < token.length; i += 1) {
    hash ^= token.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % dimension;
}

function collectTokens(text = '') {
  const raw = String(text).trim().toLowerCase();
  if (!raw) {
    return [];
  }

  const tokens = [];
  const chars = [...raw];

  chars.forEach((char) => {
    tokens.push(char);
  });

  for (let i = 0; i < chars.length - 1; i += 1) {
    tokens.push(`${chars[i]}${chars[i + 1]}`);
  }

  raw.split(/[\s,.;:!?，。；：！？、]+/).forEach((word) => {
    if (word) {
      tokens.push(word);
    }
  });

  return tokens;
}

function normalizeVector(vector = []) {
  let norm = 0;
  vector.forEach((value) => {
    norm += value * value;
  });
  norm = Math.sqrt(norm) || 1;
  return vector.map((value) => value / norm);
}

/** 将文本转为归一化向量 */
export function embedTextLocally(text, dimension = VECTOR_EMBED_DIMENSION) {
  const vector = new Array(dimension).fill(0);
  const tokens = collectTokens(text);

  tokens.forEach((token) => {
    const index = hashToken(token, dimension);
    vector[index] += 1;
  });

  return normalizeVector(vector);
}

/** 余弦相似度（向量已归一化，点积即可） */
export function cosineSimilarity(vectorA = [], vectorB = []) {
  const length = Math.min(vectorA.length, vectorB.length);
  let score = 0;
  for (let i = 0; i < length; i += 1) {
    score += vectorA[i] * vectorB[i];
  }
  return score;
}
