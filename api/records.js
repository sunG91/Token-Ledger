/**
 * 记录相关 API
 */
import http from '@/utils/request.js';
import config from '@/config/index.js';
import { fetchLocalRecentRecords } from '@/utils/usageLocalData.js';
import { normalizeRecord } from '@/utils/recordDisplay.js';

/**
 * 分页获取最近使用记录
 * @param {{ page?: number, pageSize?: number }} params
 * @returns {Promise<{ items: Array, page: number, pageSize: number, total: number }>}
 */
export async function fetchRecentRecords({ page = 1, pageSize = 20 } = {}) {
  if (config.useMock) {
    return fetchLocalRecentRecords({ page, pageSize });
  }

  const res = await http.get('/records/recent', {
    params: { page, page_size: pageSize },
  });

  const data = res.data || {};
  return {
    items: (data.items || []).map(normalizeRecord),
    page: data.page ?? page,
    pageSize: data.page_size ?? data.pageSize ?? pageSize,
    total: data.total ?? 0,
  };
}
