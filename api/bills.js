/**
 * 账单相关 API
 */
import http from '@/utils/request.js';
import config from '@/config/index.js';
import {
  fetchLocalBillModelStats,
  fetchLocalBillRecords,
  fetchLocalBillSummary,
} from '@/utils/usageLocalData.js';
import { normalizeBillRecord } from '@/utils/billDisplay.js';

/**
 * 账单汇总
 * @param {{ month?: string, platform?: string }} params
 */
export async function fetchBillSummary(params = {}) {
  const { platform = 'all', ...timeParams } = params;
  if (config.useMock) {
    return fetchLocalBillSummary({ platform, ...timeParams });
  }

  const res = await http.get('/bills/summary', {
    params: { platform, ...timeParams },
  });

  const data = res.data || {};
  return {
    totalTokens: data.total_tokens ?? data.totalTokens ?? 0,
  };
}

/**
 * 按模型统计
 * @param {{ month?: string, platform?: string }} params
 */
export async function fetchBillModelStats(params = {}) {
  const { platform = 'all', ...timeParams } = params;
  if (config.useMock) {
    return fetchLocalBillModelStats({ platform, ...timeParams });
  }

  const res = await http.get('/bills/by-model', {
    params: { platform, ...timeParams },
  });

  return (res.data?.items || res.data || []).map((item) => ({
    platformId: item.platform_id || item.platformId,
    platformLabel: item.platform_label || item.platformLabel,
    tokenCount: item.token_count ?? item.tokenCount ?? 0,
    percent: item.percent ?? 0,
  }));
}

/**
 * 账单记录分页
 * @param {{ month?: string, platform?: string, page?: number, pageSize?: number }} params
 */
export async function fetchBillRecords(params = {}) {
  const { platform = 'all', page = 1, pageSize = 20, ...timeParams } = params;
  if (config.useMock) {
    return fetchLocalBillRecords({ platform, page, pageSize, ...timeParams });
  }

  const res = await http.get('/bills/records', {
    params: {
      platform,
      page,
      page_size: pageSize,
      ...timeParams,
    },
  });

  const data = res.data || {};
  return {
    items: (data.items || []).map(normalizeBillRecord),
    page: data.page ?? page,
    pageSize: data.page_size ?? data.pageSize ?? pageSize,
    total: data.total ?? 0,
  };
}
