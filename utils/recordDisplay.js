/**
 * 记录展示格式化
 */
import dayjs from 'dayjs';
import { RECORD_SOURCE, RECORD_USAGE_SCOPE } from '@/constants/bookkeeping.js';
import { getPlatform } from '@/constants/platforms.js';
import { translate } from '@/i18n/index.js';
import { getLocale } from '@/utils/settings.js';

const IMPLICIT_MODEL_VALUES = new Set(['', 'unknown', 'default']);

function tTime(key) {
  return translate(getLocale(), `time.${key}`);
}

/**
 * 根据 source / 显式字段解析内部(对话)或外部(口述)
 */
export function resolveRecordUsageScope(raw = {}) {
  const explicit = String(raw.usage_scope || raw.usageScope || '').trim();
  if (explicit === RECORD_USAGE_SCOPE.INTERNAL || explicit === RECORD_USAGE_SCOPE.EXTERNAL) {
    return explicit;
  }
  const source = String(raw.source || '').trim();
  if (source === RECORD_SOURCE.CHAT) {
    return RECORD_USAGE_SCOPE.INTERNAL;
  }
  if (source === RECORD_SOURCE.VOICE) {
    return RECORD_USAGE_SCOPE.EXTERNAL;
  }
  return RECORD_USAGE_SCOPE.EXTERNAL;
}

export function getRecordScopeI18nKey(usageScope = '') {
  return usageScope === RECORD_USAGE_SCOPE.INTERNAL
    ? 'record.scopeInternal'
    : 'record.scopeExternal';
}

function inferModelSpecified(raw = {}) {
  if (raw.model_specified === true || raw.modelSpecified === true) {
    return true;
  }
  if (raw.model_specified === false || raw.modelSpecified === false) {
    return false;
  }
  if (resolveRecordUsageScope(raw) === RECORD_USAGE_SCOPE.INTERNAL) {
    return true;
  }
  return false;
}

/** 外部记录：仅用户口述明确模型时为 true；内部记录恒为 true */
export function isModelExplicitlySpecified(record = {}) {
  return inferModelSpecified(record);
}

export function getRecordPlatformLabel(record = {}) {
  return (
    record.platformLabel ||
    record.platformName ||
    getPlatform(record.platformId || 'other').name
  );
}

export function shouldShowRecordModel(record = {}) {
  if (resolveRecordUsageScope(record) === RECORD_USAGE_SCOPE.INTERNAL) {
    return true;
  }
  return isModelExplicitlySpecified(record);
}

export function getRecordDisplayModel(record = {}) {
  if (!shouldShowRecordModel(record)) {
    return '';
  }
  const model = String(record.modelName || '').trim();
  if (!model || IMPLICIT_MODEL_VALUES.has(model.toLowerCase())) {
    return '';
  }
  return model;
}

/** 列表/卡片主标题：外部默认仅厂商；内部或用户明确模型时带模型 */
export function getRecordDisplayTitle(record = {}) {
  const platform = getRecordPlatformLabel(record);
  const model = getRecordDisplayModel(record);
  if (!model) {
    return platform;
  }
  const keyword = platform.split(' ')[0].toLowerCase();
  if (model.toLowerCase().includes(keyword)) {
    return model;
  }
  if (resolveRecordUsageScope(record) === RECORD_USAGE_SCOPE.INTERNAL) {
    return `${platform} · ${model}`;
  }
  return `${platform} ${model}`;
}

/**
 * 根据 occurred_at 生成列表右侧时间文案
 */
export function formatRecordDisplayTime(occurredAt) {
  const date = dayjs(occurredAt);
  if (!date.isValid()) return '';

  const now = dayjs();
  if (date.isSame(now, 'day')) {
    return date.format('HH:mm');
  }
  if (date.isSame(now.subtract(1, 'day'), 'day')) {
    return tTime('yesterday');
  }
  if (date.isSame(now, 'year')) {
    return date.format('MM-DD');
  }
  return date.format('YYYY-MM-DD');
}

/**
 * 将 API / 本地原始字段规范化为前端列表项
 */
export function normalizeRecord(raw) {
  const occurredAt = raw.occurred_at || raw.occurredAt;
  const source = raw.source || RECORD_SOURCE.VOICE;
  return {
    id: raw.id,
    platformId: raw.platform_id || raw.platformId || raw.platform,
    platformName: raw.platform_name || raw.platformName,
    modelName: raw.model_name ?? raw.modelName ?? '',
    modelSpecified: inferModelSpecified(raw),
    tokenCount: raw.token_count ?? raw.tokenCount ?? 0,
    costAmount: raw.cost_amount ?? raw.costAmount,
    occurredAt,
    displayTime: raw.display_date || raw.displayTime || formatRecordDisplayTime(occurredAt),
    apiKeyId: raw.api_key_id || raw.apiKeyId || '',
    source,
    usageScope: resolveRecordUsageScope({ ...raw, source }),
    scenario: raw.scenario || '',
  };
}
