/**
 * 模型统计聚合 — 最多展示 N 项，超出合并为「其他」
 */
export const MODEL_STATS_MAX_DISPLAY = 4;

function sortModelStatsItems(items) {
  if (!items?.length) return [];
  return [...items].sort((a, b) => (b.tokenCount || 0) - (a.tokenCount || 0));
}

/** 前几名（不含「其他」） */
export function getModelStatsTopItems(items, maxDisplay = MODEL_STATS_MAX_DISPLAY) {
  const sorted = sortModelStatsItems(items);
  const topCount = maxDisplay - 1;
  return sorted.slice(0, topCount).map((item) => withChartKey(item));
}

/** 展开后饼图数据：全部拆成独立扇区，不再合并「其他」 */
export function getModelStatsExpandedChartItems(items) {
  return sortModelStatsItems(items).map((item) => withChartKey(item));
}

/**
 * @param {Array} items 原始模型统计
 * @param {number} maxDisplay 最多展示条数（含「其他」）
 */
export function aggregateModelStats(items, maxDisplay = MODEL_STATS_MAX_DISPLAY) {
  if (!items?.length) return [];

  const sorted = sortModelStatsItems(items);

  if (sorted.length <= maxDisplay) {
    return sorted.map((item) => withChartKey(item));
  }

  const topCount = maxDisplay - 1;
  const top = sorted.slice(0, topCount);
  const rest = sorted.slice(topCount);

  const others = {
    platformId: 'others',
    platformLabel: '其他',
    tokenCount: rest.reduce((sum, item) => sum + (item.tokenCount || 0), 0),
    amount: rest.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    percent: rest.reduce((sum, item) => sum + (Number(item.percent) || 0), 0),
  };

  return [...top, others].map((item) => withChartKey(item));
}

/** 获取合并进「其他」的明细项 */
export function getModelStatsOverflowItems(items, maxDisplay = MODEL_STATS_MAX_DISPLAY) {
  const sorted = sortModelStatsItems(items);
  if (sorted.length <= maxDisplay) return [];

  const topCount = maxDisplay - 1;
  return sorted.slice(topCount).map((item) => withChartKey(item));
}

function withChartKey(item) {
  return {
    ...item,
    chartKey: item.platformId,
  };
}
