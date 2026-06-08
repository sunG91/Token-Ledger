/**
 * 月度概览封装：消耗 / 额度 / 节省（仅 Token）
 */
import dayjs from 'dayjs';
import { translate } from '@/i18n/index.js';
import { USAGE_PERIOD } from '@/constants/usageAnalytics.js';
import { queryUsageDataset } from '@/utils/assistant/usageAnalytics.js';
import { loadMonthlyPlan, resolveMonthKey, sumPlannedTokens } from '@/utils/monthlyPlanStore.js';
import { getLocale } from '@/utils/settings.js';

function t(key, params) {
  return translate(getLocale(), key, params);
}

function sumTokens(records = []) {
  return records.reduce((sum, item) => sum + (Number(item.tokenCount) || 0), 0);
}

function sumOtherTokens(records = []) {
  return records
    .filter((item) => String(item.platformId || '').toLowerCase() === 'other')
    .reduce((sum, item) => sum + (Number(item.tokenCount) || 0), 0);
}

export function buildMonthlyConsumption(anchorDate = dayjs()) {
  const dataset = queryUsageDataset({
    period: USAGE_PERIOD.MONTH,
    anchorDate,
  });
  const totalTokens = sumTokens(dataset.records);
  const otherTokens = sumOtherTokens(dataset.records);

  return {
    range: dataset.range,
    recordCount: dataset.summary.recordCount,
    tokens: totalTokens,
    hint: totalTokens > 0 ? '' : t('monthlyOverview.hintNoUsage'),
    breakdown: {
      otherTokens,
      otherPercent: totalTokens > 0 ? Math.round((otherTokens / totalTokens) * 100) : 0,
    },
  };
}

export function buildMonthlyQuota(anchorDate = dayjs()) {
  const monthKey = resolveMonthKey(anchorDate);
  const plan = loadMonthlyPlan(monthKey);
  const consumption = buildMonthlyConsumption(anchorDate);
  const totalPlannedTokens = sumPlannedTokens(plan);
  const remainingTokens = Math.max(0, totalPlannedTokens - consumption.tokens);

  return {
    monthKey,
    sharedPlannedTokens: Number(plan.sharedPlannedTokens) || 0,
    totalPlannedTokens,
    remainingTokens,
    consumedTokens: consumption.tokens,
    hint: totalPlannedTokens > 0 ? '' : t('monthlyOverview.hintNoPlan'),
    items: plan.items,
  };
}

export function buildMonthlySavings(anchorDate = dayjs()) {
  const consumption = buildMonthlyConsumption(anchorDate);
  const quota = buildMonthlyQuota(anchorDate);
  const plannedTokens = quota.totalPlannedTokens;
  const consumedTokens = consumption.tokens;

  let savedTokens = 0;
  let hintKey = '';

  if (plannedTokens <= 0) {
    hintKey = 'monthlyOverview.hintSavingsNoPlan';
  } else {
    savedTokens = Math.max(0, plannedTokens - consumedTokens);
    hintKey = savedTokens > 0 ? '' : 'monthlyOverview.hintNoSavings';
  }

  return {
    savedTokens,
    plannedTokens,
    consumedTokens,
    hint: hintKey ? t(hintKey) : '',
  };
}

export function buildHomeSummary(anchorDate = dayjs()) {
  const consumption = buildMonthlyConsumption(anchorDate);
  const quota = buildMonthlyQuota(anchorDate);

  return {
    consumedTokens: consumption.tokens,
    consumedHint: consumption.hint,
    quotaTokens: quota.remainingTokens,
    totalPlannedTokens: quota.totalPlannedTokens,
    sharedPlannedTokens: quota.sharedPlannedTokens,
    quotaHint: quota.hint,
    otherTokenPercent: consumption.breakdown.otherPercent,
  };
}

export function buildProfileSavingsData(anchorDate = dayjs()) {
  const savings = buildMonthlySavings(anchorDate);
  return {
    monthlySavedTokens: savings.savedTokens,
    monthlyPlannedTokens: savings.plannedTokens,
    monthlyConsumedTokens: savings.consumedTokens,
    savingsRemark: savings.hint,
  };
}
