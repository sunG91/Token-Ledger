/**
 * 使用统计页配置
 */
export const STATS_TABS = [
  { value: 'overview', label: '概览' },
  { value: 'trend', label: '趋势' },
  { value: 'compare', label: '对比' },
];

export const STATS_TREND_GRANULARITY = [
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
];

export const STATS_RANKING_COLORS = {
  deepseek: '#5786FE',
  openai: '#74B9FF',
  claude: '#D97757',
  kimi: '#636E72',
  qwen: '#6950EF',
  others: '#B2BEC3',
};

export function getStatsRankingColor(platformId) {
  return STATS_RANKING_COLORS[platformId] || '#B2BEC3';
}
