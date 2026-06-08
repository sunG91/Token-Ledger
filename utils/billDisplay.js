/**
 * 账单展示格式化
 */
import dayjs from 'dayjs';
import { LOCALE_CODES } from '@/constants/settings.js';
import { getPlatform } from '@/constants/platforms.js';
import { translate } from '@/i18n/index.js';
import { getLocale } from '@/utils/settings.js';
import { isModelExplicitlySpecified, resolveRecordUsageScope } from '@/utils/recordDisplay.js';

function tTime(key) {
  return translate(getLocale(), `time.${key}`);
}

/** 平台展示名（ChatGPT 等别名） */
export function getBillPlatformLabel(platformId) {
  if (platformId === 'openai') return 'ChatGPT';
  return getPlatform(platformId).name;
}

/** 账单记录分组标题：今天 / 昨天 / 日期 */
export function getBillGroupLabel(occurredAt) {
  const date = dayjs(occurredAt);
  if (!date.isValid()) return '';

  const now = dayjs();
  if (date.isSame(now, 'day')) return tTime('today');
  if (date.isSame(now.subtract(1, 'day'), 'day')) return tTime('yesterday');

  const locale = getLocale();
  if (locale === LOCALE_CODES.EN) {
    return date.format('MMM D');
  }
  return date.format('M月D日');
}

/** 账单记录行内时间（今天/昨天显示 HH:mm） */
export function formatBillRecordTime(occurredAt) {
  const date = dayjs(occurredAt);
  if (!date.isValid()) return '';

  const now = dayjs();
  if (date.isSame(now, 'day') || date.isSame(now.subtract(1, 'day'), 'day')) {
    return date.format('HH:mm');
  }
  return date.format('MM-DD HH:mm');
}

/**
 * 将账单记录按日期分组
 * @param {Array} records
 * @returns {Array<{ label: string, items: Array }>}
 */
export function groupBillRecords(records) {
  const map = new Map();

  records.forEach((record) => {
    const label = getBillGroupLabel(record.occurredAt);
    if (!map.has(label)) {
      map.set(label, []);
    }
    map.get(label).push(record);
  });

  return Array.from(map.entries()).map(([label, items]) => ({
    label,
    items,
  }));
}

/**
 * 规范化账单 API / Mock 字段
 */
export function normalizeBillRecord(raw) {
  const platformId = raw.platform_id || raw.platformId || raw.platform;
  const occurredAt = raw.occurred_at || raw.occurredAt;

  return {
    id: raw.id,
    platformId,
    platformLabel: raw.platform_label || raw.platformLabel || getBillPlatformLabel(platformId),
    modelName: raw.model_name ?? raw.modelName ?? '',
    modelSpecified: isModelExplicitlySpecified(raw),
    tokenCount: raw.token_count ?? raw.tokenCount ?? 0,
    costAmount: raw.cost_amount ?? raw.costAmount ?? 0,
    occurredAt,
    displayTime: formatBillRecordTime(occurredAt),
    source: raw.source || '',
    usageScope: resolveRecordUsageScope(raw),
  };
}
