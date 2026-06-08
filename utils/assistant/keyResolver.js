/**
 * 根据 AI 传入的语义线索解析目标 API Key（备注/厂商/模型）
 */
import { getPlatform } from '@/constants/platforms.js';

function normalizeText(text = '') {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function scoreAliasMatch(hint = '', alias = '') {
  const h = normalizeText(hint);
  const a = normalizeText(alias);
  if (!h || !a) {
    return 0;
  }
  if (h === a) {
    return 1;
  }
  if (a.includes(h) || h.includes(a)) {
    return 0.92;
  }
  const hWords = h.split(/[\s,，、]+/).filter((word) => word.length > 1);
  if (!hWords.length) {
    return 0;
  }
  const matched = hWords.filter((word) => a.includes(word)).length;
  return matched / hWords.length;
}

function scoreDescriptionMatch(description = '', entry = {}) {
  const text = normalizeText(description);
  if (!text) {
    return 0;
  }
  const aliasScore = scoreAliasMatch(text, entry.alias);
  const platformScore = normalizeText(entry.platformName).includes(text) ? 0.75 : 0;
  const modelScore = normalizeText(entry.modelName).includes(text) ? 0.7 : 0;
  const platformIdScore = normalizeText(entry.platformId).includes(text) ? 0.65 : 0;
  return Math.max(aliasScore, platformScore, modelScore, platformIdScore);
}

function pickUniqueByScore(entries = [], scoreFn) {
  const scored = entries
    .map((entry) => ({ entry, score: scoreFn(entry) }))
    .filter((item) => item.score >= 0.55)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) {
    return { status: 'not_found', candidates: [] };
  }
  if (scored.length === 1 || scored[0].score - (scored[1]?.score || 0) >= 0.15) {
    return { status: 'resolved', entry: scored[0].entry, candidates: [scored[0].entry] };
  }
  return {
    status: 'ambiguous',
    candidates: scored.slice(0, 5).map((item) => item.entry),
  };
}

function filterByPlatform(boundKeys = [], platformId = '') {
  const id = normalizeText(platformId);
  if (!id) {
    return boundKeys;
  }
  return boundKeys.filter((item) => normalizeText(item.platformId) === id);
}

function filterBalanceQueryable(entries = []) {
  return entries.filter((item) => item.balanceQueryable);
}

export function resolveApiKeyFromHints(
  hints = {},
  boundKeys = [],
  { requireBalanceQueryable = false } = {}
) {
  const pool = requireBalanceQueryable ? filterBalanceQueryable(boundKeys) : boundKeys;
  const apiKeyId = String(hints.api_key_id || '').trim();

  if (apiKeyId) {
    const exact = pool.find((item) => item.apiKeyId === apiKeyId);
    if (exact) {
      return { status: 'resolved', entry: exact, candidates: [exact] };
    }
    return { status: 'not_found', candidates: [] };
  }

  const aliasHint = String(hints.alias_hint || '').trim();
  const userDescription = String(hints.user_description || '').trim();
  const descriptionHint = aliasHint || userDescription;

  if (descriptionHint) {
    const byDescription = pickUniqueByScore(pool, (entry) =>
      scoreDescriptionMatch(descriptionHint, entry)
    );
    if (byDescription.status !== 'not_found') {
      return byDescription;
    }
  }

  const platformId = String(hints.platform_id || '').trim();
  const modelName = normalizeText(hints.model_name);
  let scoped = filterByPlatform(pool, platformId);

  if (platformId && modelName) {
    scoped = scoped.filter((item) => normalizeText(item.modelName) === modelName);
  }

  if (!scoped.length) {
    return { status: 'not_found', candidates: [] };
  }

  if (scoped.length === 1) {
    return { status: 'resolved', entry: scoped[0], candidates: [scoped[0]] };
  }

  return {
    status: 'ambiguous',
    candidates: scoped,
    platformName: platformId ? getPlatform(platformId).name : '',
  };
}

export function formatKeyCandidate(entry = {}, locale = 'zh-CN') {
  const alias = entry.alias || (locale === 'en-US' ? 'No alias' : '无备注');
  const model = entry.modelName || (locale === 'en-US' ? 'unknown model' : '未知模型');
  return {
    apiKeyId: entry.apiKeyId,
    platformId: entry.platformId,
    platformName: entry.platformName,
    modelName: entry.modelName,
    alias,
    label: `${entry.platformName} · ${model} · ${alias}`,
  };
}
