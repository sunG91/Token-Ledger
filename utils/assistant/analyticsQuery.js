/**
 * 用量分析 Tool 执行（报告 / 排行 / 对比 / 单模型查询，仅 Token）
 */
import { translate } from '@/i18n/index.js';
import { USAGE_GROUP_BY, USAGE_PERIOD } from '@/constants/usageAnalytics.js';
import { getPlatform } from '@/constants/platforms.js';
import { buildAssistantBoundContext } from '@/utils/assistant/boundContext.js';
import { queryUsageDataset } from '@/utils/assistant/usageAnalytics.js';
import {
  buildPeriodUsageReport,
  buildPeriodUsageReportData,
} from '@/utils/assistant/usageReport.js';

function t(locale, key, params) {
  return translate(locale, key, params);
}

function normalizePeriod(period = '') {
  const value = String(period || '')
    .trim()
    .toLowerCase();
  if (Object.values(USAGE_PERIOD).includes(value)) {
    return value;
  }
  return USAGE_PERIOD.MONTH;
}

function normalizeGroupBy(groupBy = '') {
  const value = String(groupBy || '')
    .trim()
    .toLowerCase();
  return value === USAGE_GROUP_BY.MODEL ? USAGE_GROUP_BY.MODEL : USAGE_GROUP_BY.PLATFORM;
}

async function getConnectedPlatformIds() {
  const bound = await buildAssistantBoundContext();
  return [...new Set(bound.map((item) => item.platformId).filter(Boolean))];
}

function buildUsageCard(dataset = {}, filters = {}, locale = 'zh-CN') {
  const platformId = filters.platformId || dataset.groupedByPlatform[0]?.platformId || 'other';
  const platformName =
    filters.platformName ||
    getPlatform(platformId).name ||
    dataset.groupedByPlatform[0]?.platformName ||
    '';
  const periodLabel = dataset.range?.label || '';
  const title = filters.modelName
    ? t(locale, 'assistant.analytics.modelUsageTitle', {
        model: filters.modelName,
        period: periodLabel,
      })
    : t(locale, 'assistant.analytics.platformUsageTitle', {
        platform: platformName,
        period: periodLabel,
      });

  return {
    type: 'usage_card',
    card: {
      platformId,
      platformName,
      title,
      tokenCount: dataset.summary.totalTokens,
      occurredAt: new Date().toISOString(),
    },
  };
}

function buildReportCard(dataset = {}, locale = 'zh-CN') {
  return {
    type: 'report_card',
    card: buildPeriodUsageReport(dataset, {
      locale,
      includeQuota: dataset.range?.period === USAGE_PERIOD.MONTH,
    }),
  };
}

function buildRankingCard(dataset = {}, { groupBy = USAGE_GROUP_BY.MODEL, locale = 'zh-CN' } = {}) {
  const grouped =
    groupBy === USAGE_GROUP_BY.MODEL ? dataset.groupedByModel : dataset.groupedByPlatform;
  const title =
    groupBy === USAGE_GROUP_BY.MODEL
      ? t(locale, 'assistant.rankingTitle')
      : t(locale, 'assistant.analytics.platformRankingTitle');
  const period =
    dataset.range?.period === USAGE_PERIOD.MONTH
      ? t(locale, 'assistant.rankingPeriod')
      : dataset.range?.label || t(locale, 'assistant.rankingPeriod');

  return {
    type: 'ranking_card',
    card: {
      title,
      period,
      items: grouped.slice(0, 10).map((item) => ({
        platformId: item.platformId,
        name: item.name,
        tokenCount: item.tokenCount,
      })),
      occurredAt: new Date().toISOString(),
    },
  };
}

function buildCompareCard(dataset = {}, locale = 'zh-CN') {
  const items = dataset.groupedByPlatform
    .slice()
    .sort((a, b) => b.tokenCount - a.tokenCount)
    .map((item) => ({
      platformId: item.platformId,
      name: item.name,
      tokenCount: item.tokenCount,
    }));
  const totalTokens = items.reduce((sum, item) => sum + item.tokenCount, 0) || 1;

  return {
    type: 'report_card',
    card: {
      title: t(locale, 'assistant.analytics.compareTitle', { period: dataset.range?.label || '' }),
      totalTokens: dataset.summary.totalTokens,
      compareMode: true,
      topModels: items.slice(0, 5).map((item) => ({
        platformId: item.platformId,
        name: item.name,
        tokenCount: item.tokenCount,
        percent: Math.round((item.tokenCount / totalTokens) * 100),
      })),
      occurredAt: new Date().toISOString(),
    },
  };
}

function emptyResult(locale, key, params) {
  return {
    data: {
      ok: false,
      empty: true,
      message: t(locale, key, params),
    },
    replyCards: [],
  };
}

export async function queryModelUsage(args = {}, { locale = 'zh-CN' } = {}) {
  const period = normalizePeriod(args.period);
  const dataset = queryUsageDataset({
    period,
    platformId: args.platform_id,
    modelName: args.model_name,
    apiKeyId: args.api_key_id,
  });

  if (!dataset.records.length) {
    return emptyResult(locale, 'assistant.analytics.noData', { period: dataset.range.label });
  }

  return {
    data: {
      ok: true,
      period,
      range: dataset.range,
      summary: dataset.summary,
      total_tokens: dataset.summary.totalTokens,
    },
    replyCards: [
      buildUsageCard(
        dataset,
        {
          platformId: args.platform_id,
          platformName: args.platform_name,
          modelName: args.model_name,
        },
        locale
      ),
    ],
  };
}

export async function getUsageRanking(args = {}, { locale = 'zh-CN' } = {}) {
  const period = normalizePeriod(args.period);
  const groupBy = normalizeGroupBy(args.group_by);
  const connectedPlatformIds = await getConnectedPlatformIds();
  const dataset = queryUsageDataset({
    period,
    connectedPlatformIds,
    limit: Number(args.limit) || 10,
  });

  if (!dataset.records.length) {
    return emptyResult(locale, 'assistant.analytics.noData', { period: dataset.range.label });
  }

  const top =
    groupBy === USAGE_GROUP_BY.MODEL ? dataset.groupedByModel[0] : dataset.groupedByPlatform[0];

  return {
    data: {
      ok: true,
      period,
      group_by: groupBy,
      top_item: top || null,
      items: (groupBy === USAGE_GROUP_BY.MODEL
        ? dataset.groupedByModel
        : dataset.groupedByPlatform
      ).slice(0, Number(args.limit) || 10),
    },
    replyCards: [buildRankingCard(dataset, { groupBy, locale })],
  };
}

export async function getPeriodUsageReport(args = {}, { locale = 'zh-CN' } = {}) {
  const period = normalizePeriod(args.period || USAGE_PERIOD.MONTH);
  const dataset = queryUsageDataset({ period });

  if (!dataset.records.length) {
    return emptyResult(locale, 'assistant.analytics.noData', { period: dataset.range.label });
  }

  return {
    data: buildPeriodUsageReportData(dataset, {
      locale,
      includeQuota: period === USAGE_PERIOD.MONTH,
    }),
    replyCards: [buildReportCard(dataset, locale)],
  };
}

export async function comparePlatformCosts(args = {}, { locale = 'zh-CN' } = {}) {
  const period = normalizePeriod(args.period || USAGE_PERIOD.MONTH);
  const connectedPlatformIds = await getConnectedPlatformIds();
  if (!connectedPlatformIds.length) {
    return emptyResult(locale, 'assistant.analytics.noConnectedPlatforms');
  }

  const dataset = queryUsageDataset({
    period,
    connectedPlatformIds,
  });

  if (!dataset.records.length) {
    return emptyResult(locale, 'assistant.analytics.noData', { period: dataset.range.label });
  }

  return {
    data: {
      ok: true,
      period,
      range: dataset.range,
      platforms: dataset.groupedByPlatform.map((item) => ({
        platform_id: item.platformId,
        platform_name: item.name,
        token_count: item.tokenCount,
      })),
      summary: dataset.summary,
    },
    replyCards: [buildCompareCard(dataset, locale)],
  };
}

export async function listBillRecordSummary(args = {}, { locale = 'zh-CN' } = {}) {
  const period = normalizePeriod(args.period || USAGE_PERIOD.MONTH);
  const dataset = queryUsageDataset({ period });

  return {
    data: {
      ok: true,
      period,
      range: dataset.range,
      summary: dataset.summary,
      records: dataset.records.slice(0, 50).map((item) => ({
        id: item.id,
        platform_id: item.platformId,
        platform_name: item.platformName,
        model_name: item.modelName,
        token_count: item.tokenCount,
        occurred_at: item.occurredAt,
        source: item.source,
        scenario: item.scenario,
      })),
      export_hint: t(locale, 'assistant.analytics.exportHint'),
    },
    replyCards: [],
  };
}
