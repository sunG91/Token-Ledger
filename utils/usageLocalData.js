/**
 * 本地用户记录聚合（首页 / 账单 / 统计共用）
 */
import dayjs from 'dayjs';
import { USAGE_PERIOD } from '@/constants/usageAnalytics.js';
import { getBillPlatformLabel, normalizeBillRecord } from '@/utils/billDisplay.js';
import { filterRecordsByTime } from '@/utils/billTimeFilter.js';
import { normalizeRecord } from '@/utils/recordDisplay.js';
import { queryUsageDataset } from '@/utils/assistant/usageAnalytics.js';
import { listAllUsageRecords } from '@/utils/assistant/recordCatalog.js';
import { getWeekRange } from '@/utils/statsTimeFilter.js';

function sortByTimeDesc(records = []) {
  return [...records].sort(
    (a, b) => dayjs(b.occurredAt).valueOf() - dayjs(a.occurredAt).valueOf()
  );
}

function filterByPlatform(records = [], platform = 'all') {
  const id = String(platform || 'all').trim();
  if (!id || id === 'all') {
    return records;
  }
  return records.filter((item) => String(item.platformId) === id);
}

function filterRecordsForQuery(records = [], { platform = 'all', ...timeParams } = {}) {
  return filterByPlatform(filterRecordsByTime(records, timeParams), platform);
}

function sumTokens(records = []) {
  return records.reduce((sum, item) => sum + (Number(item.tokenCount) || 0), 0);
}

function buildPlatformStats(records = []) {
  const total = sumTokens(records) || 1;
  const map = new Map();
  records.forEach((record) => {
    const platformId = String(record.platformId || 'other');
    const current = map.get(platformId) || {
      platformId,
      platformLabel: getBillPlatformLabel(platformId),
      tokenCount: 0,
    };
    current.tokenCount += Number(record.tokenCount) || 0;
    map.set(platformId, current);
  });
  return [...map.values()]
    .map((item) => ({
      ...item,
      percent: Number(((item.tokenCount / total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.tokenCount - a.tokenCount);
}

export function fetchLocalRecentRecords({ page = 1, pageSize = 20 } = {}) {
  const all = sortByTimeDesc(listAllUsageRecords());
  const start = (Math.max(Number(page) || 1, 1) - 1) * pageSize;
  return {
    items: all.slice(start, start + pageSize).map(normalizeRecord),
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 20,
    total: all.length,
  };
}

export function fetchLocalBillSummary(params = {}) {
  const records = filterRecordsForQuery(listAllUsageRecords(), params);
  return {
    totalTokens: sumTokens(records),
  };
}

export function fetchLocalBillModelStats(params = {}) {
  const records = filterRecordsForQuery(listAllUsageRecords(), params);
  return buildPlatformStats(records);
}

export function fetchLocalBillRecords({ page = 1, pageSize = 20, ...params } = {}) {
  const records = sortByTimeDesc(filterRecordsForQuery(listAllUsageRecords(), params));
  const start = (Math.max(Number(page) || 1, 1) - 1) * pageSize;
  const slice = records.slice(start, start + pageSize);
  return {
    items: slice.map((item) =>
      normalizeBillRecord({
        ...item,
        platform_label: getBillPlatformLabel(item.platformId),
      })
    ),
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 20,
    total: records.length,
  };
}

export function fetchLocalStatsOverview(params = {}) {
  const anchor = params.month ? dayjs(`${params.month}-01`) : dayjs();
  const dataset = queryUsageDataset({
    period: USAGE_PERIOD.MONTH,
    anchorDate: anchor,
  });
  return {
    totalTokens: dataset.summary.totalTokens,
    recordCount: dataset.summary.recordCount,
  };
}

export function fetchLocalStatsRanking(params = {}) {
  const anchor = params.month ? dayjs(`${params.month}-01`) : dayjs();
  const dataset = queryUsageDataset({
    period: USAGE_PERIOD.MONTH,
    anchorDate: anchor,
  });
  const total = dataset.summary.totalTokens || 1;
  return dataset.groupedByPlatform.map((item) => ({
    platformId: item.platformId,
    platformLabel: getBillPlatformLabel(item.platformId),
    tokenCount: item.tokenCount,
    percent: Number(((item.tokenCount / total) * 100).toFixed(1)),
  }));
}

export function fetchLocalStatsCompare(params = {}) {
  const anchor = params.month ? dayjs(`${params.month}-01`) : dayjs();
  const current = queryUsageDataset({
    period: USAGE_PERIOD.MONTH,
    anchorDate: anchor,
  });
  const previous = queryUsageDataset({
    period: USAGE_PERIOD.MONTH,
    anchorDate: anchor.subtract(1, 'month'),
  });
  return {
    current: { tokens: current.summary.totalTokens },
    previous: { tokens: previous.summary.totalTokens },
  };
}

function buildTrendPointsFromRecords(records = [], { granularity = 'week', anchor } = {}) {
  const anchorDate = dayjs(anchor || undefined).isValid() ? dayjs(anchor) : dayjs();
  const points = [];

  if (granularity === 'month') {
    const monthStart = anchorDate.startOf('month');
    const daysInMonth = monthStart.daysInMonth();
    for (let i = 0; i < daysInMonth; i += 1) {
      const date = monthStart.add(i, 'day');
      const dayRecords = records.filter((item) => dayjs(item.occurredAt).isSame(date, 'day'));
      points.push({
        label: String(date.date()),
        tooltipLabel: date.format('M月D日'),
        value: sumTokens(dayRecords),
      });
    }
    return points;
  }

  const { start } = getWeekRange(anchorDate);
  for (let i = 0; i < 7; i += 1) {
    const date = start.add(i, 'day');
    const dayRecords = records.filter((item) => dayjs(item.occurredAt).isSame(date, 'day'));
    points.push({
      label: date.format('MM-DD'),
      tooltipLabel: date.format('M月D日'),
      value: sumTokens(dayRecords),
    });
  }
  return points;
}

export function fetchLocalStatsTrend(params = {}) {
  const granularity = params.granularity === 'month' ? 'month' : 'week';
  const anchor = params.anchor || params.date || dayjs().format('YYYY-MM-DD');
  const anchorDate = dayjs(anchor);
  let records = listAllUsageRecords();

  if (granularity === 'month') {
    const monthKey = anchorDate.format('YYYY-MM');
    records = records.filter((item) => dayjs(item.occurredAt).format('YYYY-MM') === monthKey);
  } else {
    const { start, end } = getWeekRange(anchorDate);
    records = records.filter((item) => {
      const occurred = dayjs(item.occurredAt);
      return !occurred.isBefore(start) && !occurred.isAfter(end);
    });
  }

  return {
    points: buildTrendPointsFromRecords(records, { granularity, anchor }),
    unit: 'token',
  };
}
