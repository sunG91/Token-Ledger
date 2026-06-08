/**
 * API Key 余额查询（实时同步厂商余额）
 */
import {
  API_KEY_BALANCE_SYNCED_EVENT,
  canSyncApiKeyBalance,
  syncApiKeyBalance,
} from '@/api/apiKeyBalance.js';
import { translate } from '@/i18n/index.js';
import { formatOfficialBalance } from '@/utils/format.js';
import { buildAssistantBoundContext } from '@/utils/assistant/boundContext.js';
import { formatKeyCandidate, resolveApiKeyFromHints } from '@/utils/assistant/keyResolver.js';

function t(locale, key, params) {
  return translate(locale, key, params);
}

export async function listPlatformBoundKeys(args = {}, { locale = 'zh-CN' } = {}) {
  const platformId = String(args.platform_id || '').trim();
  if (!platformId) {
    return {
      data: { ok: false, error: 'platform_required' },
    };
  }

  const boundKeys = await buildAssistantBoundContext();
  const items = boundKeys
    .filter(
      (item) => item.balanceQueryable && item.platformId === platformId && item.enabled !== false
    )
    .map((item) => formatKeyCandidate(item, locale));

  if (!items.length) {
    return {
      data: {
        ok: false,
        error: 'no_balance_keys',
        platform_id: platformId,
        message: t(locale, 'assistant.balance.noQueryableKeys', {
          platform: platformId,
        }),
      },
    };
  }

  return {
    data: {
      ok: true,
      platform_id: platformId,
      count: items.length,
      items,
      needs_disambiguation: items.length > 1,
      hint:
        items.length > 1
          ? t(locale, 'assistant.balance.pickKeyHint')
          : t(locale, 'assistant.balance.singleKeyReady'),
    },
  };
}

export async function queryApiKeyBalance(args = {}, { locale = 'zh-CN' } = {}) {
  const boundKeys = await buildAssistantBoundContext();
  const resolved = resolveApiKeyFromHints(args, boundKeys, { requireBalanceQueryable: true });

  if (resolved.status === 'not_found') {
    return {
      data: {
        ok: false,
        error: 'key_not_found',
        message: t(locale, 'assistant.balance.keyNotFound'),
      },
    };
  }

  if (resolved.status === 'ambiguous') {
    const candidates = resolved.candidates.map((item) => formatKeyCandidate(item, locale));
    return {
      data: {
        ok: false,
        error: 'ambiguous_key',
        needs_disambiguation: true,
        count: candidates.length,
        platform_name: resolved.platformName || candidates[0]?.platformName || '',
        candidates,
        message: t(locale, 'assistant.balance.ambiguous', { count: candidates.length }),
      },
    };
  }

  const entry = resolved.entry;
  const syncable = await canSyncApiKeyBalance(entry.apiKeyId);
  if (!syncable) {
    return {
      data: {
        ok: false,
        error: 'balance_not_supported',
        api_key_id: entry.apiKeyId,
        alias: entry.alias,
        platform_name: entry.platformName,
        message: t(locale, 'assistant.balance.notSupported'),
      },
    };
  }

  try {
    const record = await syncApiKeyBalance(entry.apiKeyId);
    uni.$emit(API_KEY_BALANCE_SYNCED_EVENT, {
      apiKeyId: entry.apiKeyId,
      record,
    });

    const amount = record.officialBalance;
    const currency = record.balanceCurrency || entry.balanceCurrency || 'CNY';
    const formatted = formatOfficialBalance(amount, currency);

    return {
      data: {
        ok: true,
        api_key_id: entry.apiKeyId,
        platform_id: entry.platformId,
        platform_name: entry.platformName,
        model_name: entry.modelName,
        alias: entry.alias,
        official_balance: amount,
        balance_currency: currency,
        formatted_balance: formatted,
        synced: true,
        message: t(locale, 'assistant.balance.result', {
          label: entry.alias || entry.platformName,
          balance: formatted,
        }),
      },
    };
  } catch (error) {
    return {
      data: {
        ok: false,
        error: 'balance_sync_failed',
        api_key_id: entry.apiKeyId,
        alias: entry.alias,
        platform_name: entry.platformName,
        cached_balance:
          entry.officialBalance !== null
            ? formatOfficialBalance(entry.officialBalance, entry.balanceCurrency)
            : '',
        message: t(locale, 'assistant.balance.syncFailed'),
      },
    };
  }
}
