/**
 * 云端用户数据清理 API
 */
import config from '@/config/index.js';
import http from '@/utils/request.js';
import { DATA_CLEAR_CATEGORY_LIST } from '@/constants/dataClear.js';

function normalizeCategories(categories = []) {
  const picked = Array.isArray(categories) ? categories : [];
  return DATA_CLEAR_CATEGORY_LIST.filter((item) => picked.includes(item));
}

/**
 * 清理云端用户数据（记账、聊天、向量等）
 * @param {string[]} categories
 */
export async function clearCloudUserData(categories = []) {
  const picked = normalizeCategories(categories);
  if (!picked.length) {
    return { cleared: [], failed: [] };
  }

  if (config.useMock) {
    await new Promise((resolve) => setTimeout(resolve, 320));
    return { cleared: picked, failed: [] };
  }

  const res = await http.delete('/user/data', {
    data: { categories: picked },
  });
  const data = res.data || {};
  return {
    cleared: Array.isArray(data.cleared) ? data.cleared : picked,
    failed: Array.isArray(data.failed) ? data.failed : [],
  };
}
