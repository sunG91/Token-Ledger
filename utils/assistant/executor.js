/**
 * AI 助手 Tool 执行器（口语记账 + 余额查询）
 */
import { ASSISTANT_TOOL_NAMES } from '@/constants/assistantTools.js';
import { translate } from '@/i18n/index.js';
import { getPlatform, isKnownPlatformId } from '@/constants/platforms.js';
import { fetchApiKeys } from '@/api/apiKeys.js';
import { listCandidateModels } from '@/utils/bookkeeping/platformMatch.js';
import { resolveRecordPlatformFromArgs } from '@/utils/bookkeeping/recordPlatform.js';
import {
  getActivePendingForSession,
  listIncompletePending,
  resolvePendingRecord,
  upsertPendingRecord,
} from '@/utils/bookkeeping/pendingMemory.js';
import {
  mergeUtteranceWithPending,
  parseBookkeepingUtterance,
} from '@/utils/bookkeeping/parseUtterance.js';
import { buildRecordCard, createUserRecord } from '@/utils/bookkeeping/recordStore.js';
import { mapMissingFieldToStatus } from '@/utils/assistant/tools.js';
import { listPlatformBoundKeys, queryApiKeyBalance } from '@/utils/assistant/balanceQuery.js';
import {
  comparePlatformCosts,
  getPeriodUsageReport,
  getUsageRanking,
  listBillRecordSummary,
  queryModelUsage,
} from '@/utils/assistant/analyticsQuery.js';
import {
  adjustMonthlyQuotaTool,
  getMonthlyQuotaStatusTool,
  setMonthlyPlanTool,
} from '@/utils/assistant/monthlyPlanQuery.js';
import { resolveApiKeyFromHints } from '@/utils/assistant/keyResolver.js';

function t(locale, key, params) {
  return translate(locale, key, params);
}

async function loadBookkeepingBoundMap() {
  const keys = await fetchApiKeys();
  const candidates = listCandidateModels(keys);
  const byId = new Map();
  candidates.forEach((item) => {
    byId.set(item.apiKeyId, item);
  });
  return { candidates, byId };
}

function resolveBookkeepingEntry(args = {}, byId) {
  const resolved = resolveApiKeyFromHints(
    {
      api_key_id: args.api_key_id,
      alias_hint: args.alias_hint,
      platform_id: args.platform_id,
      model_name: args.model_name,
      user_description: args.user_description,
    },
    [...byId.values()].map((item) => ({
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
    return byId.get(resolved.entry.apiKeyId) || null;
  }

  const platformId = String(args.platform_id || '').trim();
  const modelName = String(args.model_name || '').trim();
  if (platformId) {
    const id = String(args.api_key_id || '').trim();
    if (id && byId.has(id)) {
      return byId.get(id);
    }
    const normalizedPlatform = platformId.toLowerCase();
    const normalizedModel = modelName.toLowerCase();
    return (
      [...byId.values()].find(
        (item) =>
          item.platformId === normalizedPlatform &&
          (!normalizedModel || String(item.modelName || '').toLowerCase() === normalizedModel)
      ) || null
    );
  }

  return null;
}

export async function tryAutoConfirmPendingRecord({
  sessionId = '',
  userMessage = '',
  locale = 'zh-CN',
} = {}) {
  const pending = getActivePendingForSession(sessionId);
  if (!pending) {
    return null;
  }

  const utterance = parseBookkeepingUtterance(userMessage);
  const merged = mergeUtteranceWithPending(pending, utterance);
  const tokenCount = Number(merged.tokenCount);
  if (!Number.isFinite(tokenCount) || tokenCount <= 0) {
    return null;
  }

  const explicitModel = String(
    utterance.modelHint || (pending.modelSpecified ? pending.modelName : '') || ''
  ).trim();

  return confirmVoiceRecord(
    {
      platform_id: pending.platformId,
      platform_name: pending.platformName,
      model_name: explicitModel,
      token_count: tokenCount,
      scenario: pending.scenario || merged.scenario || userMessage,
      api_key_id: pending.apiKeyId,
      user_description: userMessage,
    },
    { sessionId, locale }
  );
}

async function confirmVoiceRecord(args = {}, { sessionId = '' } = {}) {
  const tokenCount = Number(args.token_count);
  if (!Number.isFinite(tokenCount) || tokenCount <= 0) {
    return { data: { ok: false, error: 'invalid_token_count' }, recordCard: null };
  }

  const { byId } = await loadBookkeepingBoundMap();
  const resolved = resolveRecordPlatformFromArgs(args);
  const bound = resolveBookkeepingEntry({ ...args, platform_id: resolved.platformId }, byId);

  const explicitModel = String(args.model_name || '').trim();
  const modelSpecified = !!explicitModel;

  let resolvedPlatformId = resolved.platformId;
  let platformName = resolved.platformName;
  let apiKeyId = String(args.api_key_id || '').trim();
  let modelName = explicitModel;

  if (bound) {
    resolvedPlatformId = bound.platformId;
    platformName = getPlatform(bound.platformId).name;
    apiKeyId = bound.apiKeyId;
  } else if (isKnownPlatformId(resolved.platformId)) {
    apiKeyId = '';
  } else {
    resolvedPlatformId = 'other';
    apiKeyId = '';
  }

  const record = createUserRecord({
    platformId: resolvedPlatformId,
    platformName,
    modelName,
    modelSpecified,
    tokenCount,
    scenario: String(args.scenario || args.user_description || '').trim(),
    apiKeyId,
  });

  if (!record.saved) {
    return {
      data: { ok: false, error: 'storage_save_failed' },
      recordCard: null,
    };
  }

  resolvePendingRecord({ sessionId });

  return {
    data: {
      ok: true,
      record_id: record.id,
      platform_id: resolvedPlatformId,
      platform_name: platformName,
      model_name: modelName,
      token_count: tokenCount,
      saved: true,
    },
    recordCard: buildRecordCard(record),
  };
}

async function savePendingRecord(args = {}, { sessionId = '', locale = 'zh-CN' } = {}) {
  const platformId = String(args.platform_id || 'other').trim() || 'other';
  const status = mapMissingFieldToStatus(args.missing_field);
  const { byId } = await loadBookkeepingBoundMap();
  const bound = resolveBookkeepingEntry(args, byId);

  const explicitModel = String(args.model_name || '').trim();
  const pending = upsertPendingRecord({
    sessionId,
    status,
    platformId: bound?.platformId || platformId,
    platformName:
      String(args.platform_name || '').trim() || getPlatform(bound?.platformId || platformId).name,
    modelName: explicitModel,
    modelSpecified: !!explicitModel,
    tokenCount: 0,
    scenario: String(args.scenario || '').trim(),
    apiKeyId: bound?.apiKeyId || String(args.api_key_id || '').trim(),
  });

  return {
    data: {
      ok: true,
      pending_id: pending.id,
      status: pending.status,
      message:
        status === 'awaiting_model'
          ? t(locale, 'assistant.bookkeeping.pendingSavedModel')
          : t(locale, 'assistant.bookkeeping.pendingSavedTokens'),
    },
    recordCard: null,
  };
}

function listIncompleteRecords({ locale = 'zh-CN' } = {}) {
  const pending = listIncompletePending();
  return {
    data: {
      ok: true,
      count: pending.length,
      items: pending.map((item) => ({
        id: item.id,
        session_id: item.sessionId,
        platform_id: item.platformId,
        platform_name: item.platformName,
        model_name: item.modelName,
        status: item.status,
        scenario: item.scenario,
      })),
      empty_message: pending.length ? '' : t(locale, 'assistant.bookkeeping.noIncomplete'),
    },
    recordCard: null,
  };
}

export async function executeAssistantToolCall(
  toolCall = {},
  { sessionId = '', locale = 'zh-CN' } = {}
) {
  const name = toolCall?.function?.name || '';
  let args = {};
  try {
    args = JSON.parse(toolCall?.function?.arguments || '{}');
  } catch (error) {
    args = {};
  }

  switch (name) {
    case ASSISTANT_TOOL_NAMES.CONFIRM_RECORD:
      return confirmVoiceRecord(args, { sessionId, locale });
    case ASSISTANT_TOOL_NAMES.SAVE_PENDING:
      return savePendingRecord(args, { sessionId, locale });
    case ASSISTANT_TOOL_NAMES.LIST_INCOMPLETE:
      return listIncompleteRecords({ locale });
    case ASSISTANT_TOOL_NAMES.LIST_PLATFORM_KEYS:
      return listPlatformBoundKeys(args, { locale });
    case ASSISTANT_TOOL_NAMES.QUERY_BALANCE:
      return queryApiKeyBalance(args, { locale });
    case ASSISTANT_TOOL_NAMES.QUERY_USAGE:
      return queryModelUsage(args, { locale });
    case ASSISTANT_TOOL_NAMES.GET_RANKING:
      return getUsageRanking(args, { locale });
    case ASSISTANT_TOOL_NAMES.GET_REPORT:
      return getPeriodUsageReport(args, { locale });
    case ASSISTANT_TOOL_NAMES.COMPARE_PLATFORMS:
      return comparePlatformCosts(args, { locale });
    case ASSISTANT_TOOL_NAMES.LIST_BILL_RECORDS:
      return listBillRecordSummary(args, { locale });
    case ASSISTANT_TOOL_NAMES.SET_MONTHLY_PLAN:
      return setMonthlyPlanTool(args, { locale });
    case ASSISTANT_TOOL_NAMES.ADJUST_MONTHLY_QUOTA:
      return adjustMonthlyQuotaTool(args, { locale });
    case ASSISTANT_TOOL_NAMES.GET_MONTHLY_QUOTA:
      return getMonthlyQuotaStatusTool(args, { locale });
    default:
      return {
        data: { ok: false, error: 'unknown_tool' },
        recordCard: null,
      };
  }
}

/** @deprecated 使用 executeAssistantToolCall */
export async function executeBookkeepingToolCall(toolCall, context) {
  return executeAssistantToolCall(toolCall, context);
}
