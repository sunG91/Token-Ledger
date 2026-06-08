/**
 * 记录列表 Mock 数据（分页模拟，后续对接 API 替换）
 */
import dayjs from 'dayjs';
import { listUserRecords } from '@/utils/bookkeeping/recordStore.js';
import { formatRecordDisplayTime, normalizeRecord } from '@/utils/recordDisplay.js';

const PLATFORM_IDS = ['deepseek', 'openai', 'claude', 'kimi', 'qwen'];
const MOCK_TOTAL = 86;

function buildMockRecords() {
  const now = dayjs();
  const list = [];

  for (let i = 0; i < MOCK_TOTAL; i += 1) {
    const platformId = PLATFORM_IDS[i % PLATFORM_IDS.length];
    const daysAgo = Math.floor(i / 3);
    const occurredAt = now
      .subtract(daysAgo, 'day')
      .hour(9 + (i % 10))
      .minute(10 + (i % 50));

    list.push(
      normalizeRecord({
        id: `mock-record-${i + 1}`,
        platform: platformId,
        model_name: `${platformId}-model`,
        token_count: 320 + ((i * 137) % 2800),
        cost_amount: Number(((320 + ((i * 137) % 2800)) * 0.01).toFixed(2)),
        occurred_at: occurredAt.toISOString(),
        displayTime: formatRecordDisplayTime(occurredAt.toISOString()),
      })
    );
  }

  return list;
}

const ALL_MOCK_RECORDS = buildMockRecords();

/** 供助手用量分析聚合（Mock 模式） */
export function listMockAnalyticsRecords() {
  return ALL_MOCK_RECORDS.map((item) => ({ ...item }));
}

function delay(ms = 400) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * 模拟 GET /api/v1/records/recent 分页
 */
export async function fetchMockRecentRecords({ page = 1, pageSize = 20 } = {}) {
  await delay(page === 1 ? 300 : 500);

  const userRecords = listUserRecords();
  const merged = [...userRecords, ...ALL_MOCK_RECORDS];
  const total = merged.length;
  const start = (page - 1) * pageSize;
  const items = merged.slice(start, start + pageSize);

  return {
    items,
    page,
    pageSize,
    total,
  };
}
