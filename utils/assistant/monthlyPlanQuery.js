/**
 * 月度额度计划 Tool 执行
 */
import dayjs from 'dayjs';
import { translate } from '@/i18n/index.js';
import { getPlatform } from '@/constants/platforms.js';
import { MONTHLY_PLAN_SCOPE } from '@/constants/monthlyOverview.js';
import { buildMonthlyQuota } from '@/utils/monthlyOverview.js';
import { notifyMonthlyOverviewChanged } from '@/utils/monthlyOverviewEvents.js';
import { resolveAdjustPlanScope, resolveSetPlanScope } from '@/utils/bookkeeping/planScope.js';
import {
  adjustMonthlyPlanQuota,
  resolveMonthKey,
  upsertMonthlyPlanItem,
  upsertSharedPlanTokens,
} from '@/utils/monthlyPlanStore.js';
import { fetchApiKeys } from '@/api/apiKeys.js';
import { listCandidateModels } from '@/utils/bookkeeping/platformMatch.js';
import { resolveApiKeyFromHints } from '@/utils/assistant/keyResolver.js';

function t(locale, key, params) {
  return translate(locale, key, params);
}

async function loadBoundCandidates() {
  const keys = await fetchApiKeys();
  return listCandidateModels(keys);
}

function resolvePlanEntry(args = {}, candidates = []) {
  const resolved = resolveApiKeyFromHints(
    {
      api_key_id: args.api_key_id,
      alias_hint: args.alias_hint,
      user_description: args.user_description,
      platform_id: args.platform_id,
      model_name: args.model_name,
    },
    candidates.map((item) => ({
      apiKeyId: item.apiKeyId,
      platformId: item.platformId,
      platformName: getPlatform(item.platformId).name,
      modelName: item.modelName,
      alias: item.alias || '',
      balanceQueryable: true,
      enabled: true,
    }))
  );

  if (resolved.status === 'resolved') {
    const entry = candidates.find((item) => item.apiKeyId === resolved.entry.apiKeyId);
    return entry || null;
  }

  const platformId = String(args.platform_id || '').trim();
  const modelName = String(args.model_name || '').trim();
  if (platformId) {
    const normalizedPlatform = platformId.toLowerCase();
    const normalizedModel = modelName.toLowerCase();
    return (
      candidates.find(
        (item) =>
          item.platformId === normalizedPlatform &&
          (!normalizedModel || String(item.modelName || '').toLowerCase() === normalizedModel)
      ) || null
    );
  }

  return null;
}

function formatPlannedItemsList(items = [], locale = 'zh-CN') {
  if (!items.length) {
    return '';
  }
  return items
    .map((item) =>
      t(locale, 'assistant.monthlyPlan.plannedItemLine', {
        platform: item.platformName || getPlatform(item.platformId).name,
        model: item.modelName || t(locale, 'assistant.monthlyPlan.anyModel'),
        tokens: item.plannedTokens,
      })
    )
    .join('\n');
}

export async function setMonthlyPlanTool(args = {}, { locale = 'zh-CN' } = {}) {
  const plannedTokens = Number(args.planned_tokens);
  if (!Number.isFinite(plannedTokens) || plannedTokens <= 0) {
    return {
      data: { ok: false, error: 'invalid_planned_tokens' },
      replyCards: [],
    };
  }

  const scope = resolveSetPlanScope(args);
  const monthKey = args.month_key || resolveMonthKey();

  if (scope === MONTHLY_PLAN_SCOPE.SHARED) {
    const result = upsertSharedPlanTokens({ monthKey, plannedTokens });
    if (!result.ok) {
      return { data: { ok: false, error: result.error }, replyCards: [] };
    }
    const quota = buildMonthlyQuota();
    notifyMonthlyOverviewChanged();
    return {
      data: {
        ok: true,
        scope: MONTHLY_PLAN_SCOPE.SHARED,
        month_key: result.monthKey,
        planned_tokens: plannedTokens,
        shared_planned_tokens: result.sharedPlannedTokens,
        total_planned_tokens: result.totalPlannedTokens,
        remaining_tokens: quota.remainingTokens,
        message: t(locale, 'assistant.monthlyPlan.sharedPlanAdded', {
          tokens: plannedTokens,
          shared: result.sharedPlannedTokens,
          total: result.totalPlannedTokens,
        }),
      },
      replyCards: [],
    };
  }

  const candidates = await loadBoundCandidates();
  const bound = resolvePlanEntry(args, candidates);
  const platformId = bound?.platformId || String(args.platform_id || 'other').trim() || 'other';
  const platformName =
    bound?.platformName || String(args.platform_name || '').trim() || getPlatform(platformId).name;
  const modelName = bound?.modelName || String(args.model_name || '').trim() || 'unknown';
  const apiKeyId = bound?.apiKeyId || String(args.api_key_id || '').trim();

  const result = upsertMonthlyPlanItem({
    monthKey,
    platformId,
    platformName,
    modelName,
    apiKeyId,
    plannedTokens,
  });

  if (!result.ok) {
    return {
      data: { ok: false, error: result.error },
      replyCards: [],
    };
  }

  const quota = buildMonthlyQuota();
  notifyMonthlyOverviewChanged();
  return {
    data: {
      ok: true,
      scope: MONTHLY_PLAN_SCOPE.MODEL,
      month_key: result.monthKey,
      platform_id: platformId,
      model_name: modelName,
      planned_tokens: plannedTokens,
      total_planned_tokens: result.totalPlannedTokens,
      remaining_tokens: quota.remainingTokens,
      message: t(locale, 'assistant.monthlyPlan.planAdded', {
        platform: platformName,
        model: modelName,
        tokens: plannedTokens,
        total: result.totalPlannedTokens,
      }),
    },
    replyCards: [],
  };
}

export async function adjustMonthlyQuotaTool(args = {}, { locale = 'zh-CN' } = {}) {
  const tokenDelta = Number(args.token_delta);
  if (!Number.isFinite(tokenDelta) || tokenDelta === 0) {
    return {
      data: { ok: false, error: 'invalid_token_delta' },
      replyCards: [],
    };
  }

  const scope = resolveAdjustPlanScope(args);
  const monthKey = args.month_key || resolveMonthKey();
  const candidates = await loadBoundCandidates();
  const bound = resolvePlanEntry(args, candidates);
  const platformId = bound?.platformId || String(args.platform_id || 'other').trim() || 'other';
  const platformName =
    bound?.platformName || String(args.platform_name || '').trim() || getPlatform(platformId).name;
  const modelName = bound?.modelName || String(args.model_name || '').trim();
  const apiKeyId = bound?.apiKeyId || String(args.api_key_id || '').trim();

  const result = adjustMonthlyPlanQuota({
    monthKey,
    platformId,
    platformName,
    modelName,
    apiKeyId,
    tokenDelta,
    reason: String(args.reason || args.user_description || '').trim(),
    targetScope: scope,
  });

  if (!result.ok) {
    if (result.error === 'model_plan_not_found') {
      const plannedList = formatPlannedItemsList(result.plannedItems, locale);
      return {
        data: {
          ok: false,
          error: result.error,
          shared_planned_tokens: result.sharedPlannedTokens,
          planned_items: result.plannedItems,
          message: plannedList
            ? t(locale, 'assistant.monthlyPlan.modelPlanNotFound', {
                platform: platformName,
                model: modelName || t(locale, 'assistant.monthlyPlan.anyModel'),
                list: plannedList,
              })
            : t(locale, 'assistant.monthlyPlan.noModelPlans', {
                shared: result.sharedPlannedTokens || 0,
              }),
        },
        replyCards: [],
      };
    }
    return {
      data: { ok: false, error: result.error },
      replyCards: [],
    };
  }

  const quota = buildMonthlyQuota();
  notifyMonthlyOverviewChanged();

  if (scope === MONTHLY_PLAN_SCOPE.SHARED) {
    const messageKey =
      tokenDelta < 0
        ? 'assistant.monthlyPlan.sharedQuotaDeducted'
        : 'assistant.monthlyPlan.sharedQuotaAdded';
    return {
      data: {
        ok: true,
        scope: MONTHLY_PLAN_SCOPE.SHARED,
        month_key: result.monthKey,
        token_delta: tokenDelta,
        shared_planned_tokens: result.sharedPlannedTokens,
        total_planned_tokens: result.totalPlannedTokens,
        remaining_tokens: quota.remainingTokens,
        message: t(locale, messageKey, {
          tokens: Math.abs(tokenDelta),
          shared: result.sharedPlannedTokens,
          total: result.totalPlannedTokens,
        }),
      },
      replyCards: [],
    };
  }

  const messageKey =
    tokenDelta < 0 ? 'assistant.monthlyPlan.quotaDeducted' : 'assistant.monthlyPlan.quotaAdded';

  return {
    data: {
      ok: true,
      scope: MONTHLY_PLAN_SCOPE.MODEL,
      month_key: result.monthKey,
      token_delta: tokenDelta,
      total_planned_tokens: result.totalPlannedTokens,
      remaining_tokens: quota.remainingTokens,
      message: t(locale, messageKey, {
        platform: platformName,
        model: modelName || t(locale, 'assistant.monthlyPlan.anyModel'),
        tokens: Math.abs(tokenDelta),
        total: result.totalPlannedTokens,
      }),
    },
    replyCards: [],
  };
}

export async function getMonthlyQuotaStatusTool(args = {}, { locale = 'zh-CN' } = {}) {
  const quota = buildMonthlyQuota(args.month_key ? dayjs(`${args.month_key}-01`) : undefined);

  return {
    data: {
      ok: true,
      month_key: quota.monthKey,
      shared_planned_tokens: quota.sharedPlannedTokens,
      total_planned_tokens: quota.totalPlannedTokens,
      consumed_tokens: quota.consumedTokens,
      remaining_tokens: quota.remainingTokens,
      hint: quota.hint,
      items: quota.items,
      message:
        quota.totalPlannedTokens > 0
          ? t(locale, 'assistant.monthlyPlan.statusSummary', {
              planned: quota.totalPlannedTokens,
              consumed: quota.consumedTokens,
              remaining: quota.remainingTokens,
            })
          : t(locale, 'assistant.monthlyPlan.statusEmpty'),
    },
    replyCards: [],
  };
}
