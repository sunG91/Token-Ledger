/**
 * 周期使用报告构建（内部对话 / 外部记账分栏，仅 Token）
 */
import dayjs from 'dayjs';
import { RECORD_USAGE_SCOPE } from '@/constants/bookkeeping.js';
import { getPlatform, isKnownPlatformId } from '@/constants/platforms.js';
import { USAGE_PERIOD } from '@/constants/usageAnalytics.js';
import { translate } from '@/i18n/index.js';
import { buildMonthlyQuota } from '@/utils/monthlyOverview.js';
import { loadMonthlyPlan } from '@/utils/monthlyPlanStore.js';
import { resolveRecordUsageScope } from '@/utils/recordDisplay.js';
import { buildTopModels } from '@/utils/assistant/usageAnalytics.js';

function t(locale, key, params) {
  return translate(locale, key, params);
}

export function resolvePlatformLabel(record = {}) {
  const platformId = String(record.platformId || 'other')
    .trim()
    .toLowerCase();
  if (isKnownPlatformId(platformId)) {
    return getPlatform(platformId).name;
  }
  const customName = String(record.platformName || '').trim();
  return customName || getPlatform('other').name;
}

function buildPlatformGroupKey(record = {}) {
  const platformId = String(record.platformId || 'other')
    .trim()
    .toLowerCase();
  if (isKnownPlatformId(platformId)) {
    return platformId;
  }
  const label = resolvePlatformLabel(record);
  return `other::${label.toLowerCase()}`;
}

function groupRecordsByPlatform(records = []) {
  const map = new Map();
  records.forEach((record) => {
    const key = buildPlatformGroupKey(record);
    const platformId = isKnownPlatformId(record.platformId) ? record.platformId : 'other';
    const current = map.get(key) || {
      platformId,
      name: resolvePlatformLabel(record),
      tokenCount: 0,
      recordCount: 0,
    };
    current.tokenCount += Number(record.tokenCount) || 0;
    current.recordCount += 1;
    map.set(key, current);
  });

  const items = [...map.values()].sort((a, b) => b.tokenCount - a.tokenCount);
  const totalTokens = items.reduce((sum, item) => sum + item.tokenCount, 0) || 1;
  return items.map((item) => ({
    ...item,
    percent: Math.round((item.tokenCount / totalTokens) * 100),
  }));
}

function groupRecordsByModel(records = []) {
  const map = new Map();
  records.forEach((record) => {
    const model = String(record.modelName || '').trim();
    const platformLabel = resolvePlatformLabel(record);
    const platformId = isKnownPlatformId(record.platformId) ? record.platformId : 'other';
    const key =
      model && model !== 'unknown'
        ? `${platformId}::${model.toLowerCase()}`
        : buildPlatformGroupKey(record);
    const name = model && model !== 'unknown' ? `${platformLabel} · ${model}` : platformLabel;
    const current = map.get(key) || {
      platformId,
      name,
      tokenCount: 0,
      recordCount: 0,
    };
    current.tokenCount += Number(record.tokenCount) || 0;
    current.recordCount += 1;
    map.set(key, current);
  });

  const items = [...map.values()].sort((a, b) => b.tokenCount - a.tokenCount);
  const totalTokens = items.reduce((sum, item) => sum + item.tokenCount, 0) || 1;
  return items.map((item) => ({
    ...item,
    percent: Math.round((item.tokenCount / totalTokens) * 100),
  }));
}

function buildScopeSection(records = [], { groupBy = 'platform' } = {}) {
  const platforms =
    groupBy === 'model' ? groupRecordsByModel(records) : groupRecordsByPlatform(records);
  const totalTokens = platforms.reduce((sum, item) => sum + item.tokenCount, 0);
  return {
    totalTokens,
    recordCount: records.length,
    platforms,
  };
}

function formatPlanAdjustments(adjustments = [], locale = 'zh-CN') {
  return adjustments
    .filter((item) => Number(item.tokenDelta))
    .map((item) => {
      const delta = Number(item.tokenDelta) || 0;
      if (item.scope === 'model') {
        const platformName = item.platformName || getPlatform(item.platformId).name;
        const modelName = item.modelName || t(locale, 'assistant.monthlyPlan.anyModel');
        return {
          label: t(locale, 'assistant.report.adjustModel', {
            platform: platformName,
            model: modelName,
          }),
          tokenDelta: delta,
        };
      }
      return {
        label: t(locale, 'assistant.report.adjustShared'),
        tokenDelta: delta,
      };
    });
}

function buildQuotaSection(locale = 'zh-CN') {
  const quota = buildMonthlyQuota();
  if (!quota.totalPlannedTokens) {
    return null;
  }
  const plan = loadMonthlyPlan(quota.monthKey);
  return {
    sharedPlannedTokens: quota.sharedPlannedTokens,
    totalPlannedTokens: quota.totalPlannedTokens,
    consumedTokens: quota.consumedTokens,
    remainingTokens: quota.remainingTokens,
    adjustments: formatPlanAdjustments(plan.adjustments, locale),
  };
}

export function buildPeriodUsageReport(
  dataset = {},
  { locale = 'zh-CN', includeQuota = true } = {}
) {
  const records = dataset.records || [];
  const internalRecords = records.filter(
    (item) => resolveRecordUsageScope(item) === RECORD_USAGE_SCOPE.INTERNAL
  );
  const externalRecords = records.filter(
    (item) => resolveRecordUsageScope(item) !== RECORD_USAGE_SCOPE.INTERNAL
  );

  const monthLabel =
    dataset.range?.period === USAGE_PERIOD.WEEK
      ? t(locale, 'assistant.analytics.weekReportTitle', { range: dataset.range.label })
      : t(locale, 'assistant.reportTitle', {
          month: dataset.range?.label || dayjs().format('YYYY-MM'),
        });

  const topModels = buildTopModels(internalRecords).map(({ costAmount: _cost, ...item }) => item);
  const includeQuotaSection = includeQuota && dataset.range?.period === USAGE_PERIOD.MONTH;

  return {
    title: monthLabel,
    totalTokens: dataset.summary?.totalTokens || 0,
    recordCount: records.length,
    internal: buildScopeSection(internalRecords, { groupBy: 'model' }),
    external: buildScopeSection(externalRecords, { groupBy: 'platform' }),
    topModels,
    quota: includeQuotaSection ? buildQuotaSection(locale) : null,
    occurredAt: new Date().toISOString(),
  };
}

/** Tool 返回给模型的精简结构（不含金额、调用次数等废弃字段） */
export function buildPeriodUsageReportData(
  dataset = {},
  { locale = 'zh-CN', includeQuota = true } = {}
) {
  const card = buildPeriodUsageReport(dataset, { locale, includeQuota });
  return {
    ok: true,
    period: dataset.range?.period || USAGE_PERIOD.MONTH,
    range: {
      label: dataset.range?.label || '',
      period: dataset.range?.period || USAGE_PERIOD.MONTH,
    },
    total_tokens: card.totalTokens,
    record_count: card.recordCount,
    internal: {
      total_tokens: card.internal.totalTokens,
      record_count: card.internal.recordCount,
      platforms: card.internal.platforms.map((item) => ({
        platform_id: item.platformId,
        platform_name: item.name,
        token_count: item.tokenCount,
        record_count: item.recordCount,
      })),
    },
    external: {
      total_tokens: card.external.totalTokens,
      record_count: card.external.recordCount,
      platforms: card.external.platforms.map((item) => ({
        platform_id: item.platformId,
        platform_name: item.name,
        token_count: item.tokenCount,
        record_count: item.recordCount,
      })),
    },
    top_models: card.topModels.map((item) => ({
      platform_id: item.platformId,
      name: item.name,
      token_count: item.tokenCount,
      percent: item.percent,
    })),
    quota: card.quota
      ? {
          shared_planned_tokens: card.quota.sharedPlannedTokens,
          total_planned_tokens: card.quota.totalPlannedTokens,
          consumed_tokens: card.quota.consumedTokens,
          remaining_tokens: card.quota.remainingTokens,
          adjustments: card.quota.adjustments,
        }
      : null,
    report_hint: t(locale, 'assistant.report.toolHint'),
  };
}
