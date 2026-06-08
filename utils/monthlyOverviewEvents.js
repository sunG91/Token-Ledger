/**
 * 月度概览变更通知（计划额度 / 消耗记录更新后刷新首页等）
 */
export const MONTHLY_OVERVIEW_CHANGED = 'monthly-overview-changed';

export function notifyMonthlyOverviewChanged() {
  uni.$emit(MONTHLY_OVERVIEW_CHANGED);
}
