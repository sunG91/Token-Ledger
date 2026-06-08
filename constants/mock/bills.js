/**
 * 账单页 Mock 数据
 */
import dayjs from 'dayjs';
import { normalizeBillRecord } from '@/utils/billDisplay.js';
import { filterRecordsByTime } from '@/utils/billTimeFilter.js';

const PLATFORM_IDS = ['deepseek', 'openai', 'claude', 'kimi', 'qwen'];
const MODEL_NAMES = {
  deepseek: ['DeepSeek R1', 'DeepSeek V3'],
  openai: ['GPT-4o', 'GPT-4o mini'],
  claude: ['Claude 3.5 Sonnet', 'Claude 3 Haiku'],
  kimi: ['Kimi K2', 'Kimi Moonshot'],
  qwen: ['Qwen Max', 'Qwen Turbo'],
};

const MOCK_SUMMARY = {
  totalAmount: 124.5,
  totalTokens: 12450,
};

const MOCK_MODEL_STATS = [
  {
    platformId: 'deepseek',
    platformLabel: 'DeepSeek',
    tokenCount: 7320,
    percent: 58.7,
    amount: 73.2,
  },
  {
    platformId: 'openai',
    platformLabel: 'ChatGPT',
    tokenCount: 3120,
    percent: 25.1,
    amount: 31.2,
  },
  {
    platformId: 'claude',
    platformLabel: 'Claude',
    tokenCount: 1660,
    percent: 13.5,
    amount: 16.8,
  },
  {
    platformId: 'kimi',
    platformLabel: 'Kimi',
    tokenCount: 330,
    percent: 2.7,
    amount: 3.3,
  },
  {
    platformId: 'qwen',
    platformLabel: '通义千问',
    tokenCount: 250,
    percent: 2.0,
    amount: 2.5,
  },
  {
    platformId: 'minimax',
    platformLabel: 'MiniMax',
    tokenCount: 80,
    percent: 0.6,
    amount: 0.8,
  },
];

function buildMockBillRecords() {
  const now = dayjs();
  const list = [];

  for (let i = 0; i < 48; i += 1) {
    const platformId = PLATFORM_IDS[i % PLATFORM_IDS.length];
    const modelNames = MODEL_NAMES[platformId];
    const modelName = modelNames[i % modelNames.length];
    const daysAgo = Math.floor(i / 2);
    const tokenCount = 180 + ((i * 97) % 1200);
    const occurredAt = now
      .subtract(daysAgo, 'day')
      .hour(8 + (i % 12))
      .minute(5 + (i % 50))
      .second(0);

    list.push(
      normalizeBillRecord({
        id: `bill-${i + 1}`,
        platform: platformId,
        model_name: modelName,
        token_count: tokenCount,
        cost_amount: Number((tokenCount * 0.01).toFixed(2)),
        occurred_at: occurredAt.toISOString(),
      })
    );
  }

  return list;
}

const ALL_MOCK_BILL_RECORDS = buildMockBillRecords();

function delay(ms = 350) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function filterByPlatform(records, platform) {
  if (!platform || platform === 'all') return records;
  return records.filter((item) => item.platformId === platform);
}

function applyBillFilters(records, params = {}) {
  const { platform, ...timeParams } = params;
  return filterRecordsByTime(filterByPlatform(records, platform), timeParams);
}

/**
 * 模拟 GET /api/v1/bills/summary
 */
export async function fetchMockBillSummary(params = {}) {
  await delay();

  const filteredRecords = applyBillFilters(ALL_MOCK_BILL_RECORDS, params);
  if (!filteredRecords.length) {
    return { totalAmount: 0, totalTokens: 0 };
  }

  const totalAmount = filteredRecords.reduce(
    (sum, item) => sum + (Number(item.costAmount) || 0),
    0
  );
  const totalTokens = filteredRecords.reduce(
    (sum, item) => sum + (Number(item.tokenCount) || 0),
    0
  );

  return {
    totalAmount: Number(totalAmount.toFixed(2)),
    totalTokens,
  };
}

/**
 * 模拟 GET /api/v1/bills/by-model
 */
export async function fetchMockBillModelStats(params = {}) {
  await delay();

  const filteredRecords = applyBillFilters(ALL_MOCK_BILL_RECORDS, params);
  if (!filteredRecords.length) {
    return [];
  }

  const totalTokens = filteredRecords.reduce(
    (sum, item) => sum + (Number(item.tokenCount) || 0),
    0
  );
  const grouped = filteredRecords.reduce((map, item) => {
    const current = map.get(item.platformId) || {
      platformId: item.platformId,
      platformLabel: item.platformLabel,
      tokenCount: 0,
      amount: 0,
    };
    current.tokenCount += Number(item.tokenCount) || 0;
    current.amount += Number(item.costAmount) || 0;
    map.set(item.platformId, current);
    return map;
  }, new Map());

  return [...grouped.values()]
    .map((item) => ({
      ...item,
      amount: Number(item.amount.toFixed(2)),
      percent: totalTokens ? Number(((item.tokenCount / totalTokens) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.tokenCount - a.tokenCount);
}

/**
 * 模拟 GET /api/v1/bills/records
 */
export async function fetchMockBillRecords(params = {}) {
  const { page = 1, pageSize = 20 } = params;
  await delay(page === 1 ? 280 : 420);

  const filtered = applyBillFilters(ALL_MOCK_BILL_RECORDS, params);
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return {
    items,
    page,
    pageSize,
    total: filtered.length,
  };
}
