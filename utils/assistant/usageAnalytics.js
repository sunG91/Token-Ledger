/**
 * 用量统计聚合（基于本地记录目录）
 */
import dayjs from 'dayjs';
import { getPlatform } from '@/constants/platforms.js';
import { USAGE_GROUP_BY, USAGE_PERIOD } from '@/constants/usageAnalytics.js';
import { estimateTokenCost } from '@/utils/assistant/costCalibrator.js';
import { listAllUsageRecords } from '@/utils/assistant/recordCatalog.js';

function toDayjs(value) {
  return dayjs(value);
}

export function resolvePeriodRange(period = USAGE_PERIOD.MONTH, anchorDate = dayjs()) {
  const anchor = toDayjs(anchorDate);
  switch (period) {
    case USAGE_PERIOD.TODAY:
      return {
        period,
        label: anchor.format('YYYY-MM-DD'),
        start: anchor.startOf('day'),
        end: anchor.endOf('day'),
      };
    case USAGE_PERIOD.YESTERDAY: {
      const day = anchor.subtract(1, 'day');
      return {
        period,
        label: day.format('YYYY-MM-DD'),
        start: day.startOf('day'),
        end: day.endOf('day'),
      };
    }
    case USAGE_PERIOD.WEEK:
      return {
        period,
        label: `${anchor.startOf('week').format('MM-DD')} ~ ${anchor.endOf('week').format('MM-DD')}`,
        start: anchor.startOf('week'),
        end: anchor.endOf('week'),
      };
    case USAGE_PERIOD.MONTH:
    default:
      return {
        period: USAGE_PERIOD.MONTH,
        label: anchor.format('YYYY年M月'),
        start: anchor.startOf('month'),
        end: anchor.endOf('month'),
      };
  }
}

function normalizeText(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase();
}

export function filterRecords(records = [], filters = {}) {
  const range = resolvePeriodRange(filters.period || USAGE_PERIOD.MONTH, filters.anchorDate);
  const platformId = normalizeText(filters.platformId);
  const modelName = normalizeText(filters.modelName);
  const apiKeyId = String(filters.apiKeyId || '').trim();
  const connectedPlatformIds = Array.isArray(filters.connectedPlatformIds)
    ? filters.connectedPlatformIds.map((item) => normalizeText(item)).filter(Boolean)
    : [];

  return records.filter((record) => {
    const occurred = toDayjs(record.occurredAt);
    if (!occurred.isValid()) {
      return false;
    }
    if (occurred.isBefore(range.start) || occurred.isAfter(range.end)) {
      return false;
    }
    if (platformId && normalizeText(record.platformId) !== platformId) {
      return false;
    }
    if (modelName && normalizeText(record.modelName) !== modelName) {
      return false;
    }
    if (apiKeyId && record.apiKeyId !== apiKeyId) {
      return false;
    }
    if (
      connectedPlatformIds.length &&
      !connectedPlatformIds.includes(normalizeText(record.platformId))
    ) {
      return false;
    }
    return true;
  });
}

function resolveRecordCostAmount(record = {}) {
  const tokenCount = Number(record.tokenCount) || 0;
  if (tokenCount <= 0) {
    return 0;
  }
  return estimateTokenCost({
    apiKeyId: record.apiKeyId,
    modelName: record.modelName,
    platformId: record.platformId,
    tokenCount,
  }).costAmount;
}

/** 口语记账按条数≠调用次数；费用统一按 token × 校准单价重算 */
export function enrichRecordsForAnalytics(records = []) {
  return records.map((record) => ({
    ...record,
    costAmount: Number(resolveRecordCostAmount(record).toFixed(4)),
  }));
}

export function aggregateUsage(records = []) {
  const enriched = enrichRecordsForAnalytics(records);
  const totalTokens = enriched.reduce((sum, item) => sum + (Number(item.tokenCount) || 0), 0);
  const totalCost = enriched.reduce((sum, item) => sum + (Number(item.costAmount) || 0), 0);
  return {
    totalTokens,
    totalCost: Number(totalCost.toFixed(2)),
    recordCount: enriched.length,
  };
}

function buildGroupKey(record = {}, groupBy = USAGE_GROUP_BY.PLATFORM) {
  if (groupBy === USAGE_GROUP_BY.MODEL) {
    return `${record.platformId}::${record.modelName}`;
  }
  return String(record.platformId || 'other');
}

export function groupUsageRecords(records = [], groupBy = USAGE_GROUP_BY.PLATFORM) {
  const map = new Map();
  records.forEach((record) => {
    const key = buildGroupKey(record, groupBy);
    const current = map.get(key) || {
      key,
      platformId: record.platformId,
      platformName: record.platformName || getPlatform(record.platformId).name,
      modelName: record.modelName || '',
      name:
        groupBy === USAGE_GROUP_BY.MODEL
          ? `${record.platformName || getPlatform(record.platformId).name} · ${record.modelName}`
          : record.platformName || getPlatform(record.platformId).name,
      tokenCount: 0,
      costAmount: 0,
    };
    const tokenCount = Number(record.tokenCount) || 0;
    current.tokenCount += tokenCount;
    current.costAmount += resolveRecordCostAmount(record);
    map.set(key, current);
  });

  return [...map.values()]
    .map((item) => ({
      ...item,
      costAmount: Number(item.costAmount.toFixed(2)),
    }))
    .sort((a, b) => b.tokenCount - a.tokenCount);
}

export function buildTopModels(records = [], limit = 5) {
  const grouped = groupUsageRecords(records, USAGE_GROUP_BY.MODEL);
  const totalTokens = grouped.reduce((sum, item) => sum + item.tokenCount, 0) || 1;
  return grouped.slice(0, limit).map((item) => ({
    platformId: item.platformId,
    name: item.name,
    tokenCount: item.tokenCount,
    costAmount: item.costAmount,
    percent: Math.round((item.tokenCount / totalTokens) * 100),
  }));
}

export function queryUsageDataset(filters = {}) {
  const allRecords = listAllUsageRecords();
  const range = resolvePeriodRange(filters.period || USAGE_PERIOD.MONTH, filters.anchorDate);
  const filtered = enrichRecordsForAnalytics(filterRecords(allRecords, filters));
  const summary = aggregateUsage(filtered);
  return {
    range,
    records: filtered,
    summary,
    groupedByPlatform: groupUsageRecords(filtered, USAGE_GROUP_BY.PLATFORM),
    groupedByModel: groupUsageRecords(filtered, USAGE_GROUP_BY.MODEL),
    topModels: buildTopModels(filtered, filters.limit || 5),
  };
}
