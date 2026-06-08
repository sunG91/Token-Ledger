/**
 * 本地 / 云端用户数据清理
 */
import {
  BOOKKEEPING_STORAGE_PREFIX,
  USER_RECORDS_STORAGE_PREFIX,
} from '@/constants/bookkeeping.js';
import { CHAT_STORAGE_PREFIX } from '@/constants/chat.js';
import { COST_CALIBRATION_STORAGE_PREFIX } from '@/constants/costCalibration.js';
import { DATA_CLEAR_CATEGORIES, DATA_CLEAR_CATEGORY_LIST } from '@/constants/dataClear.js';
import { MONTHLY_PLAN_STORAGE_PREFIX } from '@/constants/monthlyOverview.js';
import { VECTOR_MEMORY_PREFIX } from '@/constants/vectorMemory.js';
import { getCurrentUserId } from '@/utils/apiKeysStorage.js';
import { formatVectorMemorySize } from '@/utils/vectorMemory.js';
import { notifyMonthlyOverviewChanged } from '@/utils/monthlyOverviewEvents.js';
import { getStorageItem, purgeStorageItem } from '@/utils/storage.js';

export const DATA_CLEARED_EVENT = 'data-cleared';

function resolveUserId(userId) {
  return userId || getCurrentUserId();
}

function getCategoryStorageKey(category, userId) {
  const id = resolveUserId(userId);
  switch (category) {
    case DATA_CLEAR_CATEGORIES.RECORDS:
      return `${USER_RECORDS_STORAGE_PREFIX}${id}`;
    case DATA_CLEAR_CATEGORIES.CHAT:
      return `${CHAT_STORAGE_PREFIX}${id}`;
    case DATA_CLEAR_CATEGORIES.VECTOR:
      return `${VECTOR_MEMORY_PREFIX}${id}`;
    case DATA_CLEAR_CATEGORIES.PENDING:
      return `${BOOKKEEPING_STORAGE_PREFIX}${id}`;
    case DATA_CLEAR_CATEGORIES.MONTHLY_PLAN:
      return `${MONTHLY_PLAN_STORAGE_PREFIX}${id}`;
    case DATA_CLEAR_CATEGORIES.COST_CALIBRATION:
      return `${COST_CALIBRATION_STORAGE_PREFIX}${id}`;
    default:
      return '';
  }
}

function countCategoryItems(category, raw) {
  if (!raw) {
    return 0;
  }
  try {
    const parsed = JSON.parse(raw);
    switch (category) {
      case DATA_CLEAR_CATEGORIES.RECORDS:
        return Array.isArray(parsed) ? parsed.length : 0;
      case DATA_CLEAR_CATEGORIES.CHAT:
        return Array.isArray(parsed.sessions) ? parsed.sessions.length : 0;
      case DATA_CLEAR_CATEGORIES.VECTOR:
        return Array.isArray(parsed.entries) ? parsed.entries.length : 0;
      case DATA_CLEAR_CATEGORIES.PENDING:
        return Array.isArray(parsed.pending) ? parsed.pending.length : 0;
      case DATA_CLEAR_CATEGORIES.MONTHLY_PLAN:
        return parsed && typeof parsed === 'object' ? Object.keys(parsed).length : 0;
      case DATA_CLEAR_CATEGORIES.COST_CALIBRATION:
        return parsed.profiles && typeof parsed.profiles === 'object'
          ? Object.keys(parsed.profiles).length
          : 0;
      default:
        return 0;
    }
  } catch (error) {
    return 0;
  }
}

export function getLocalCategoryStats(category, userId) {
  const key = getCategoryStorageKey(category, userId);
  const raw = getStorageItem(key, '');
  const size = raw ? String(raw).length : 0;
  const count = countCategoryItems(category, raw);
  return {
    category,
    key,
    exists: !!raw,
    size,
    count,
    sizeLabel: formatVectorMemorySize(size),
  };
}

export function getAllLocalDataStats(userId) {
  return DATA_CLEAR_CATEGORY_LIST.map((category) => getLocalCategoryStats(category, userId));
}

function clearLocalCategory(category, userId) {
  const key = getCategoryStorageKey(category, userId);
  if (!key) {
    return false;
  }
  return purgeStorageItem(key);
}

function normalizeCategories(categories = []) {
  const picked = Array.isArray(categories) ? categories : [];
  return DATA_CLEAR_CATEGORY_LIST.filter((item) => picked.includes(item));
}

function emitDataCleared(scope, categories) {
  uni.$emit(DATA_CLEARED_EVENT, { scope, categories });
  if (
    categories.includes(DATA_CLEAR_CATEGORIES.RECORDS) ||
    categories.includes(DATA_CLEAR_CATEGORIES.MONTHLY_PLAN)
  ) {
    notifyMonthlyOverviewChanged();
  }
}

/**
 * 按类别清理本机数据
 * @returns {{ cleared: string[], failed: string[] }}
 */
export function clearLocalUserData(categories = [], userId) {
  const picked = normalizeCategories(categories);
  const cleared = [];
  const failed = [];

  picked.forEach((category) => {
    if (clearLocalCategory(category, userId)) {
      cleared.push(category);
    } else {
      failed.push(category);
    }
  });

  if (cleared.length) {
    emitDataCleared('local', cleared);
  }

  return { cleared, failed };
}
