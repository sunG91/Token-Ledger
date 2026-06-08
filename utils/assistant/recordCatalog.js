/**
 * 助手用量分析统一记录目录（仅用户真实记录）
 */
import { listUserRecords } from '@/utils/bookkeeping/recordStore.js';

export function listAllUsageRecords(userId) {
  return listUserRecords(userId);
}
