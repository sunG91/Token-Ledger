/**
 * 口语化记账语义解析（本地规则，三端兼容）
 */
import { resolvePlatformIdFromText } from '@/utils/bookkeeping/platformMatch.js';

const RECORD_VERBS =
  /记(?:了一笔|账|录)|记账|记录(?:了)?|花了|用了|消耗(?:了)?|add\s+a?\s*record|log\s+usage|recorded/i;
const INCOMPLETE_QUERY =
  /还有哪些.*(?:没|未).*(?:详细|完整|记)|没有详细记录|待补|未完成.*账|incomplete\s+record|pending\s+record/i;
const MODEL_PATTERN =
  /\b([\w][\w.-]{1,48})\b(?:\s*模型)?(?=\s*(?:用了|消耗|花|记|token|tokens|，|,|。|$))/i;
const TOKEN_PATTERN =
  /(\d[\d,]*)\s*(?:k|K)?\s*(?:个\s*)?tokens?|(\d[\d,]*)\s*(?:万)?\s*(?:token|令牌)/i;
const SCENARIO_PATTERN = /(?:用来|用于|场景|写|做|搞|调试|测试|翻译|写代码|聊天)([^，。,.]{2,40})/i;

function extractTokenCount(text = '') {
  const raw = String(text);
  const wanShort = raw.match(/(\d+)\s*万\s*(\d)(?!\d)/);
  if (wanShort) {
    return Number(wanShort[1]) * 10000 + Number(wanShort[2]) * 1000;
  }
  const wanDecimal = raw.match(/(\d+(?:\.\d+)?)\s*万/);
  if (wanDecimal) {
    return Math.round(Number(wanDecimal[1]) * 10000);
  }
  const wMatch = raw.match(/(\d+(?:\.\d+)?)\s*w\b/i);
  if (wMatch) {
    return Math.round(Number(wMatch[1]) * 10000);
  }

  const match = raw.match(TOKEN_PATTERN);
  if (!match) {
    const num = raw.match(/(\d[\d,]{2,})/);
    return num ? Number(num[1].replace(/,/g, '')) : null;
  }
  const digits = (match[1] || match[2] || '').replace(/,/g, '');
  let value = Number(digits);
  if (!Number.isFinite(value)) {
    return null;
  }
  if (/k\s*tokens?/i.test(text) && value < 1000) {
    value *= 1000;
  }
  if (text.includes('万') && value < 10000) {
    value *= 10000;
  }
  return value > 0 ? value : null;
}

function extractModelHint(text = '') {
  const knownHints = [
    'deepseek-chat',
    'deepseek-reasoner',
    'gpt-4o',
    'gpt-4o-mini',
    'claude-3-5-sonnet',
    'kimi',
    'qwen-max',
    'qwen-turbo',
  ];
  const lower = String(text).toLowerCase();
  const hit = knownHints.find((item) => lower.includes(item));
  if (hit) {
    return hit;
  }
  const match = String(text).match(MODEL_PATTERN);
  return match ? match[1] : '';
}

function extractScenario(text = '') {
  const match = String(text).match(SCENARIO_PATTERN);
  if (match?.[1]) {
    return match[1].trim();
  }
  if (/写代码|coding|debug|翻译|聊天|写文案|画图/.test(text)) {
    return text.match(/写代码|coding|debug|翻译|聊天|写文案|画图/i)?.[0] || '';
  }
  return '';
}

export function isBookkeepingUtterance(text = '') {
  const raw = String(text || '').trim();
  if (!raw) {
    return false;
  }
  return RECORD_VERBS.test(raw) || INCOMPLETE_QUERY.test(raw) || !!resolvePlatformIdFromText(raw);
}

export function parseBookkeepingUtterance(text = '') {
  const raw = String(text || '').trim();

  if (INCOMPLETE_QUERY.test(raw)) {
    return {
      intent: 'list_incomplete',
      platformHint: '',
      modelHint: '',
      tokenCount: null,
      scenario: '',
      isRecordLike: false,
    };
  }

  const isRecordLike = RECORD_VERBS.test(raw) || !!resolvePlatformIdFromText(raw);
  if (!isRecordLike) {
    return {
      intent: 'none',
      platformHint: '',
      modelHint: '',
      tokenCount: null,
      scenario: '',
      isRecordLike: false,
    };
  }

  return {
    intent: 'record',
    platformHint: resolvePlatformIdFromText(raw) || raw,
    modelHint: extractModelHint(raw),
    tokenCount: extractTokenCount(raw),
    scenario: extractScenario(raw),
    isRecordLike: true,
    rawText: raw,
  };
}

export function mergeUtteranceWithPending(pending = null, utterance = {}) {
  if (!pending) {
    return { ...utterance };
  }
  return {
    intent: utterance.intent === 'none' ? 'record' : utterance.intent,
    platformHint: utterance.platformHint || pending.platformId || pending.platformHint || '',
    modelHint: utterance.modelHint || (pending.modelSpecified ? pending.modelName : '') || '',
    tokenCount:
      utterance.tokenCount !== null && utterance.tokenCount !== undefined
        ? utterance.tokenCount
        : pending.tokenCount,
    scenario: utterance.scenario || pending.scenario || '',
    isRecordLike: true,
    pendingId: pending.id,
    apiKeyId: pending.apiKeyId || '',
    rawText: utterance.rawText || '',
  };
}
