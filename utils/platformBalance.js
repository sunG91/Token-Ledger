/**
 * 平台账户余额查询
 * DeepSeek: https://api-docs.deepseek.com/zh-cn/api/get-user-balance
 */
import {
  PLATFORM_API_ERROR,
  createClientPlatformError,
  createHttpPlatformError,
  createPlatformApiError,
  resolvePlatformIdFromEndpoint,
} from '@/utils/platformApiErrors.js';

const REQUEST_TIMEOUT_MS = 20000;

function normalizeBalanceInfo(entry = {}) {
  const total = Number(entry.total_balance ?? entry.totalBalance);
  if (!Number.isFinite(total)) {
    return null;
  }
  return {
    currency: String(entry.currency || 'CNY').toUpperCase(),
    totalBalance: total,
    grantedBalance: Number(entry.granted_balance ?? entry.grantedBalance) || 0,
    toppedUpBalance: Number(entry.topped_up_balance ?? entry.toppedUpBalance) || 0,
  };
}

/**
 * 解析余额响应（DeepSeek balance_infos + 通用兜底）
 */
export function parseBalanceResponse(payload = {}) {
  const infos = Array.isArray(payload.balance_infos)
    ? payload.balance_infos
    : Array.isArray(payload.balanceInfos)
      ? payload.balanceInfos
      : [];

  const normalizedInfos = infos.map(normalizeBalanceInfo).filter(Boolean);
  if (normalizedInfos.length) {
    const primary =
      normalizedInfos.find((item) => item.currency === 'CNY') || normalizedInfos[0];
    const isAvailable = payload.is_available ?? payload.isAvailable;
    return {
      officialBalance: primary.totalBalance,
      balanceCurrency: primary.currency,
      isAvailable: typeof isAvailable === 'boolean' ? isAvailable : null,
      balanceInfos: normalizedInfos,
    };
  }

  const fallbackAmount = Number(
    payload.total_balance ?? payload.totalBalance ?? payload.balance ?? payload.amount,
  );
  if (Number.isFinite(fallbackAmount)) {
    return {
      officialBalance: fallbackAmount,
      balanceCurrency: String(payload.currency || payload.balance_currency || 'CNY').toUpperCase(),
      isAvailable: payload.is_available ?? payload.isAvailable ?? null,
      balanceInfos: [],
    };
  }

  return null;
}

/**
 * @param {string} endpoint
 * @param {string} apiKey
 * @param {{ platformId?: string }} [options]
 */
export function fetchPlatformBalance(endpoint, apiKey, options = {}) {
  const url = String(endpoint || '').trim();
  const key = String(apiKey || '').trim();
  const platformId = options.platformId || resolvePlatformIdFromEndpoint(url) || 'generic';

  if (!url) {
    return Promise.reject(
      createClientPlatformError(PLATFORM_API_ERROR.BALANCE_ENDPOINT_REQUIRED, platformId),
    );
  }
  if (!key) {
    return Promise.reject(
      createClientPlatformError(PLATFORM_API_ERROR.API_KEY_REQUIRED, platformId),
    );
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method: 'GET',
      timeout: REQUEST_TIMEOUT_MS,
      header: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      success: (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(createHttpPlatformError(platformId, res.statusCode, res.data));
          return;
        }
        const parsed = parseBalanceResponse(res.data);
        if (!parsed) {
          reject(
            createClientPlatformError(PLATFORM_API_ERROR.BALANCE_PARSE_ERROR, platformId),
          );
          return;
        }
        resolve(parsed);
      },
      fail: () => {
        reject(
          createPlatformApiError({
            code: PLATFORM_API_ERROR.NETWORK_ERROR,
            platformId,
            i18nKey: 'networkError',
          }),
        );
      },
    });
  });
}
