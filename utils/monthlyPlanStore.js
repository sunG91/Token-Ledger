/**
 * 月度额度计划本地存储（公用池 + 模型专属计划）
 */
import dayjs from 'dayjs';
import { MONTHLY_PLAN_STORAGE_PREFIX } from '@/constants/monthlyOverview.js';
import { getPlatform } from '@/constants/platforms.js';
import { getCurrentUserId } from '@/utils/apiKeysStorage.js';
import { createMessageId } from '@/utils/chatMessage.js';
import { getStorageItem, setStorageItem } from '@/utils/storage.js';

function getStorageKey(userId) {
  return `${MONTHLY_PLAN_STORAGE_PREFIX}${userId || getCurrentUserId()}`;
}

export function resolveMonthKey(anchorDate = dayjs()) {
  return dayjs(anchorDate).format('YYYY-MM');
}

function createEmptyPlan(monthKey) {
  return {
    monthKey,
    sharedPlannedTokens: 0,
    items: [],
    adjustments: [],
    updatedAt: new Date().toISOString(),
  };
}

function loadAllPlans(userId) {
  const raw = getStorageItem(getStorageKey(userId), '{}');
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
}

function saveAllPlans(map, userId) {
  setStorageItem(getStorageKey(userId), JSON.stringify(map && typeof map === 'object' ? map : {}));
}

export function loadMonthlyPlan(monthKey, userId) {
  const key = String(monthKey || resolveMonthKey()).trim();
  const all = loadAllPlans(userId);
  const plan = all[key] || createEmptyPlan(key);
  return {
    ...createEmptyPlan(key),
    ...plan,
    monthKey: key,
    sharedPlannedTokens: Number(plan.sharedPlannedTokens) || 0,
    items: Array.isArray(plan.items) ? plan.items : [],
    adjustments: Array.isArray(plan.adjustments) ? plan.adjustments : [],
  };
}

function persistMonthlyPlan(plan, userId) {
  const monthKey = String(plan?.monthKey || resolveMonthKey()).trim();
  const all = loadAllPlans(userId);
  all[monthKey] = {
    ...createEmptyPlan(monthKey),
    ...plan,
    monthKey,
    sharedPlannedTokens: Math.max(0, Number(plan.sharedPlannedTokens) || 0),
    updatedAt: new Date().toISOString(),
  };
  saveAllPlans(all, userId);
  return all[monthKey];
}

function findPlanItemIndex(items = [], { platformId = '', modelName = '', apiKeyId = '' } = {}) {
  const normalizedPlatform = String(platformId || '')
    .trim()
    .toLowerCase();
  const normalizedModel = String(modelName || '')
    .trim()
    .toLowerCase();
  const normalizedKeyId = String(apiKeyId || '').trim();
  return items.findIndex((item) => {
    const samePlatform = String(item.platformId || '').toLowerCase() === normalizedPlatform;
    const sameModel = String(item.modelName || '').toLowerCase() === normalizedModel;
    const sameKey = !normalizedKeyId || !item.apiKeyId || String(item.apiKeyId) === normalizedKeyId;
    return samePlatform && sameModel && sameKey;
  });
}

function applyTokenDeltaToItems(items, adjustment, delta) {
  const nextItems = [...items];
  if (delta > 0) {
    const index = findPlanItemIndex(nextItems, adjustment);
    const platform = getPlatform(adjustment.platformId);
    if (index >= 0) {
      const current = nextItems[index];
      nextItems[index] = {
        ...current,
        plannedTokens: (Number(current.plannedTokens) || 0) + delta,
        updatedAt: new Date().toISOString(),
      };
      return nextItems;
    }
    nextItems.push({
      id: createMessageId('plan-item'),
      platformId: adjustment.platformId,
      platformName: adjustment.platformName || platform.name,
      modelName: adjustment.modelName || 'unknown',
      apiKeyId: adjustment.apiKeyId,
      plannedTokens: delta,
      updatedAt: new Date().toISOString(),
    });
    return nextItems;
  }

  const deduct = Math.abs(delta);
  const index = findPlanItemIndex(nextItems, adjustment);
  if (index < 0) {
    return nextItems;
  }
  const current = nextItems[index];
  const nextTokens = Math.max(0, (Number(current.plannedTokens) || 0) - deduct);
  if (nextTokens <= 0) {
    nextItems.splice(index, 1);
  } else {
    nextItems[index] = {
      ...current,
      plannedTokens: nextTokens,
      updatedAt: new Date().toISOString(),
    };
  }
  return nextItems;
}

export function sumPlannedTokens(plan = {}) {
  const shared = Number(plan.sharedPlannedTokens) || 0;
  const modelTotal = (plan.items || []).reduce(
    (sum, item) => sum + (Number(item.plannedTokens) || 0),
    0
  );
  return shared + modelTotal;
}

export function listModelPlanItems(plan = {}) {
  return (plan.items || []).filter((item) => (Number(item.plannedTokens) || 0) > 0);
}

export function upsertSharedPlanTokens({ monthKey, plannedTokens = 0, userId } = {}) {
  const tokens = Number(plannedTokens) || 0;
  if (tokens <= 0) {
    return { ok: false, error: 'invalid_planned_tokens' };
  }

  const resolvedMonthKey = String(monthKey || resolveMonthKey()).trim();
  const plan = loadMonthlyPlan(resolvedMonthKey, userId);
  plan.sharedPlannedTokens = (Number(plan.sharedPlannedTokens) || 0) + tokens;
  const saved = persistMonthlyPlan(plan, userId);

  return {
    ok: true,
    monthKey: resolvedMonthKey,
    sharedPlannedTokens: saved.sharedPlannedTokens,
    totalPlannedTokens: sumPlannedTokens(saved),
    items: saved.items,
  };
}

export function adjustSharedPlanQuota({
  monthKey,
  tokenDelta = 0,
  reason = '',
  userId,
} = {}) {
  const delta = Number(tokenDelta) || 0;
  if (!delta) {
    return { ok: false, error: 'invalid_token_delta' };
  }

  const resolvedMonthKey = String(monthKey || resolveMonthKey()).trim();
  const plan = loadMonthlyPlan(resolvedMonthKey, userId);
  const adjustment = {
    id: createMessageId('plan-adjust'),
    scope: 'shared',
    tokenDelta: delta,
    reason: String(reason || '').trim(),
    updatedAt: new Date().toISOString(),
  };

  plan.adjustments.push(adjustment);
  plan.sharedPlannedTokens = Math.max(0, (Number(plan.sharedPlannedTokens) || 0) + delta);
  const saved = persistMonthlyPlan(plan, userId);

  return {
    ok: true,
    monthKey: resolvedMonthKey,
    adjustment,
    sharedPlannedTokens: saved.sharedPlannedTokens,
    totalPlannedTokens: sumPlannedTokens(saved),
    items: saved.items,
  };
}

export function upsertMonthlyPlanItem({
  monthKey,
  platformId = 'other',
  platformName = '',
  modelName = '',
  apiKeyId = '',
  plannedTokens = 0,
  userId,
} = {}) {
  const tokens = Number(plannedTokens) || 0;
  if (tokens <= 0) {
    return { ok: false, error: 'invalid_planned_tokens' };
  }

  const resolvedMonthKey = String(monthKey || resolveMonthKey()).trim();
  const plan = loadMonthlyPlan(resolvedMonthKey, userId);
  const platform = getPlatform(platformId);
  const itemSeed = {
    platformId: String(platformId || 'other').trim() || 'other',
    platformName: String(platformName || platform.name).trim() || platform.name,
    modelName: String(modelName || 'unknown').trim() || 'unknown',
    apiKeyId: String(apiKeyId || '').trim(),
  };

  plan.items = applyTokenDeltaToItems(plan.items, itemSeed, tokens);
  const saved = persistMonthlyPlan(plan, userId);
  const itemIndex = findPlanItemIndex(saved.items, itemSeed);

  return {
    ok: true,
    monthKey: resolvedMonthKey,
    item: itemIndex >= 0 ? saved.items[itemIndex] : null,
    totalPlannedTokens: sumPlannedTokens(saved),
    sharedPlannedTokens: saved.sharedPlannedTokens,
    items: saved.items,
  };
}

export function adjustMonthlyPlanQuota({
  monthKey,
  platformId = 'other',
  platformName = '',
  modelName = '',
  apiKeyId = '',
  tokenDelta = 0,
  reason = '',
  targetScope = 'shared',
  userId,
} = {}) {
  const delta = Number(tokenDelta) || 0;
  if (!delta) {
    return { ok: false, error: 'invalid_token_delta' };
  }

  const scope = String(targetScope || 'shared').trim().toLowerCase();
  if (scope === 'shared') {
    return adjustSharedPlanQuota({ monthKey, tokenDelta: delta, reason, userId });
  }

  const resolvedMonthKey = String(monthKey || resolveMonthKey()).trim();
  const plan = loadMonthlyPlan(resolvedMonthKey, userId);
  const platform = getPlatform(platformId);
  const adjustment = {
    id: createMessageId('plan-adjust'),
    scope: 'model',
    platformId: String(platformId || 'other').trim() || 'other',
    platformName: String(platformName || platform.name).trim() || platform.name,
    modelName: String(modelName || '').trim(),
    apiKeyId: String(apiKeyId || '').trim(),
    tokenDelta: delta,
    reason: String(reason || '').trim(),
    updatedAt: new Date().toISOString(),
  };

  if (delta < 0 && findPlanItemIndex(plan.items, adjustment) < 0) {
    return {
      ok: false,
      error: 'model_plan_not_found',
      plannedItems: listModelPlanItems(plan),
      sharedPlannedTokens: plan.sharedPlannedTokens,
    };
  }

  plan.adjustments.push(adjustment);
  plan.items = applyTokenDeltaToItems(plan.items, adjustment, delta);
  const saved = persistMonthlyPlan(plan, userId);

  return {
    ok: true,
    monthKey: resolvedMonthKey,
    adjustment,
    totalPlannedTokens: sumPlannedTokens(saved),
    sharedPlannedTokens: saved.sharedPlannedTokens,
    items: saved.items,
  };
}
