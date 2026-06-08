/**
 * 使用统计 API
 */
import http from '@/utils/request.js';
import config from '@/config/index.js';
import {
  fetchLocalStatsCompare,
  fetchLocalStatsOverview,
  fetchLocalStatsRanking,
  fetchLocalStatsTrend,
} from '@/utils/usageLocalData.js';

export async function fetchStatsOverview(params = {}) {
  if (config.useMock) {
    return fetchLocalStatsOverview(params);
  }

  const res = await http.get('/stats/overview', { params });
  const data = res.data || {};
  return {
    totalTokens: data.total_tokens ?? data.totalTokens ?? 0,
    recordCount: data.record_count ?? data.recordCount ?? 0,
  };
}

export async function fetchStatsTrend(params = {}) {
  if (config.useMock) {
    return fetchLocalStatsTrend(params);
  }

  const res = await http.get('/stats/trend', { params });
  const data = res.data || {};
  return {
    points: data.points || [],
    unit: data.unit || 'token',
  };
}

export async function fetchStatsRanking(params = {}) {
  if (config.useMock) {
    return fetchLocalStatsRanking(params);
  }

  const res = await http.get('/stats/ranking', { params });
  return (res.data?.items || res.data || []).map((item) => ({
    platformId: item.platform_id || item.platformId,
    platformLabel: item.platform_label || item.platformLabel,
    tokenCount: item.token_count ?? item.tokenCount ?? 0,
    percent: item.percent ?? 0,
  }));
}

export async function fetchStatsCompare(params = {}) {
  if (config.useMock) {
    return fetchLocalStatsCompare(params);
  }

  const res = await http.get('/stats/compare', { params });
  const data = res.data || {};
  return {
    current: data.current || {},
    previous: data.previous || data.compare || {},
  };
}
