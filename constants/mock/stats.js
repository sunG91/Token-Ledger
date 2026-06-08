/**
 * 使用统计 Mock 数据
 */
import dayjs from 'dayjs';
import { getWeekRange, resolveStatsTrendParams } from '@/utils/statsTimeFilter.js';

function delay(ms = 320) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const MOCK_OVERVIEW = {
  totalTokens: 12450,
  totalAmount: 124.5,
  totalCalls: 156,
};

const MOCK_RANKING = [
  {
    platformId: 'deepseek',
    platformLabel: 'DeepSeek',
    tokenCount: 7320,
    percent: 58.7,
  },
  {
    platformId: 'openai',
    platformLabel: 'ChatGPT',
    tokenCount: 3120,
    percent: 25.1,
  },
  {
    platformId: 'claude',
    platformLabel: 'Claude',
    tokenCount: 1680,
    percent: 13.5,
  },
  {
    platformId: 'kimi',
    platformLabel: 'Kimi',
    tokenCount: 330,
    percent: 2.7,
  },
];

const TREND_VALUE_SEEDS = [620, 840, 1250, 980, 1100, 760, 1320, 890, 1050, 1180, 940, 1010];

function buildTrendValue(index) {
  return TREND_VALUE_SEEDS[index % TREND_VALUE_SEEDS.length];
}

function buildTrendPoints(params = {}) {
  const { granularity = 'week', anchor } = resolveStatsTrendParams(
    params.granularity || 'week',
    params.anchor || params.date
  );
  const anchorDate = dayjs(anchor);
  const points = [];

  if (granularity === 'month') {
    const monthStart = anchorDate.startOf('month');
    const daysInMonth = monthStart.daysInMonth();
    for (let i = 0; i < daysInMonth; i += 1) {
      const date = monthStart.add(i, 'day');
      points.push({
        label: String(date.date()),
        tooltipLabel: date.format('M月D日'),
        value: buildTrendValue(i),
      });
    }
    return points;
  }

  const { start } = getWeekRange(anchorDate);
  for (let i = 0; i < 7; i += 1) {
    const date = start.add(i, 'day');
    points.push({
      label: date.format('MM-DD'),
      value: buildTrendValue(i),
    });
  }

  return points;
}

const MOCK_COMPARE = {
  current: {
    label: '本月',
    tokens: 12450,
    amount: 124.5,
    calls: 156,
  },
  previous: {
    label: '上月',
    tokens: 9860,
    amount: 98.6,
    calls: 128,
  },
};

export async function fetchMockStatsOverview() {
  await delay();
  return { ...MOCK_OVERVIEW };
}

export async function fetchMockStatsTrend(params = {}) {
  await delay();
  return {
    points: buildTrendPoints(params),
    unit: 'token',
  };
}

export async function fetchMockStatsRanking({ limit = 10 } = {}) {
  await delay();
  return MOCK_RANKING.slice(0, limit).map((item) => ({ ...item }));
}

export async function fetchMockStatsCompare() {
  await delay(280);
  return {
    current: { ...MOCK_COMPARE.current },
    previous: { ...MOCK_COMPARE.previous },
  };
}
