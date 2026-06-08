/**
 * 账单页筛选选项
 */
import { PLATFORMS } from '@/constants/platforms.js';

export const BILL_TIME_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'this_month', label: '本月' },
  { value: 'last_month', label: '上月' },
  { value: 'last_3_months', label: '近3月' },
];

export const BILL_PLATFORM_OPTIONS = [
  { value: 'all', label: '全部' },
  ...Object.values(PLATFORMS).map((item) => ({
    value: item.id,
    label: item.id === 'openai' ? 'ChatGPT' : item.name,
  })),
];

export const MODEL_CHART_COLORS = {
  deepseek: '#5786FE',
  openai: '#74B9FF',
  claude: '#D97757',
  kimi: '#636E72',
  qwen: '#6950EF',
  others: '#B2BEC3',
};

function hexToRgba(hex, alpha) {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getModelChartColor(platformId, alpha = 1) {
  const hex = MODEL_CHART_COLORS[platformId] || '#B2BEC3';
  if (alpha >= 1) return hex;
  return hexToRgba(hex, alpha);
}
