/**
 * 首页概览接口
 */
import { buildHomeSummary } from '@/utils/monthlyOverview.js';

export function fetchHomeSummary() {
  return Promise.resolve(buildHomeSummary());
}
