/**
 * 快捷 Chips 预设 — 图标 + i18n 文案 + 提问
 */

export const QUICK_CHIP_PRESETS = [
  {
    key: 'report-monthly',
    labelKey: 'assistant.chips.reportMonthly',
    promptKey: 'assistant.chips.reportMonthlyPrompt',
    icon: 'file-text-fill',
    iconColor: '#0984E3',
    iconBg: 'rgba(9, 132, 227, 0.14)',
  },
  {
    key: 'report-weekly',
    labelKey: 'assistant.chips.reportWeekly',
    promptKey: 'assistant.chips.reportWeeklyPrompt',
    icon: 'calendar-fill',
    iconColor: '#6C5CE7',
    iconBg: 'rgba(108, 92, 231, 0.14)',
  },
  {
    key: 'report-export',
    labelKey: 'assistant.chips.reportExport',
    promptKey: 'assistant.chips.reportExportPrompt',
    icon: 'order',
    iconColor: '#00B894',
    iconBg: 'rgba(0, 184, 148, 0.14)',
  },
  {
    key: 'report-compare',
    labelKey: 'assistant.chips.reportCompare',
    promptKey: 'assistant.chips.reportComparePrompt',
    icon: 'grid-fill',
    iconColor: '#0984E3',
    iconBg: 'rgba(9, 132, 227, 0.12)',
  },
  {
    key: 'rank-top',
    labelKey: 'assistant.chips.rankTop',
    promptKey: 'assistant.chips.rankTopPrompt',
    icon: 'star-fill',
    iconColor: '#FDCB6E',
    iconBg: 'rgba(253, 203, 110, 0.22)',
  },
  {
    key: 'rank-list',
    labelKey: 'assistant.chips.rankList',
    promptKey: 'assistant.chips.rankListPrompt',
    icon: 'level',
    iconColor: '#6C5CE7',
    iconBg: 'rgba(108, 92, 231, 0.14)',
  },
  {
    key: 'usage-deepseek',
    labelKey: 'assistant.chips.usageDeepseek',
    promptKey: 'assistant.chips.usageDeepseekPrompt',
    icon: 'eye-fill',
    iconColor: '#5786FE',
    iconBg: 'rgba(87, 134, 254, 0.14)',
  },
  {
    key: 'usage-yesterday',
    labelKey: 'assistant.chips.usageYesterday',
    promptKey: 'assistant.chips.usageYesterdayPrompt',
    icon: 'clock-fill',
    iconColor: '#0984E3',
    iconBg: 'rgba(9, 132, 227, 0.12)',
  },
  {
    key: 'record-quick',
    labelKey: 'assistant.chips.recordQuick',
    promptKey: 'assistant.chips.recordQuickPrompt',
    icon: 'edit-pen-fill',
    iconColor: '#6C5CE7',
    iconBg: 'rgba(108, 92, 231, 0.12)',
  },
  {
    key: 'tokens-monthly',
    labelKey: 'assistant.chips.tokensMonthly',
    promptKey: 'assistant.chips.tokensMonthlyPrompt',
    icon: 'order',
    iconColor: '#0984E3',
    iconBg: 'rgba(9, 132, 227, 0.12)',
  },
];

/** 报告卡片可用的图标（从报告类预设中取） */
const REPORT_CHIP_KEYS = ['report-monthly', 'report-weekly', 'report-export', 'report-compare'];

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 从预设中随机抽取若干条
 * @param {number} count 展示条数，默认 2
 */
export function pickRandomQuickChips(count = 2) {
  const size = Math.min(count, QUICK_CHIP_PRESETS.length);
  return shuffle(QUICK_CHIP_PRESETS).slice(0, size);
}

/** 报告卡片标题图标 — 从报告类预设随机取一组 */
export function pickReportIcon() {
  const pool = QUICK_CHIP_PRESETS.filter((item) => REPORT_CHIP_KEYS.includes(item.key));
  return pool[Math.floor(Math.random() * pool.length)];
}
