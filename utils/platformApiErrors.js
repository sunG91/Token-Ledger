/**
 * 官方 / 自定义平台 API 错误解析与 i18n
 */
import { mapHttpStatusToPlatformErrorKey } from '@/constants/platformErrors/index.js';
import { DEEPSEEK_PLATFORM_ID } from '@/constants/platformErrors/deepseek.js';
import { isIntegratedPlatformId } from '@/constants/integratedPlatforms.js';
import { translate } from '@/i18n/index.js';
import { isCustomApiKey } from '@/utils/apiKey.js';
import { getLocale } from '@/utils/settings.js';

export const PLATFORM_API_ERROR = {
  MODELS_ENDPOINT_REQUIRED: 'MODELS_ENDPOINT_REQUIRED',
  BALANCE_ENDPOINT_REQUIRED: 'BALANCE_ENDPOINT_REQUIRED',
  CHAT_ENDPOINT_REQUIRED: 'CHAT_ENDPOINT_REQUIRED',
  CHAT_MODEL_REQUIRED: 'CHAT_MODEL_REQUIRED',
  API_KEY_REQUIRED: 'API_KEY_REQUIRED',
  MODEL_LIST_EMPTY: 'MODEL_LIST_EMPTY',
  BALANCE_PARSE_ERROR: 'BALANCE_PARSE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
};

const LEGACY_CLIENT_CODE_KEYS = {
  [PLATFORM_API_ERROR.MODELS_ENDPOINT_REQUIRED]: 'modelsEndpointRequired',
  [PLATFORM_API_ERROR.CHAT_ENDPOINT_REQUIRED]: 'chatEndpointRequired',
  [PLATFORM_API_ERROR.CHAT_MODEL_REQUIRED]: 'chatModelRequired',
  [PLATFORM_API_ERROR.API_KEY_REQUIRED]: 'apiKeyRequired',
  [PLATFORM_API_ERROR.MODEL_LIST_EMPTY]: 'modelsEmpty',
  MODEL_LIST_NETWORK_ERROR: 'networkError',
  MODEL_LIST_HTTP_ERROR: 'httpFallback',
  MODEL_LIST_EMPTY: 'modelsEmpty',
  MODELS_ENDPOINT_REQUIRED: 'modelsEndpointRequired',
  BALANCE_ENDPOINT_REQUIRED: 'balanceEndpointRequired',
  BALANCE_PARSE_ERROR: 'balanceParseError',
  API_KEY_REQUIRED: 'apiKeyRequired',
};

export class PlatformApiError extends Error {
  constructor({
    code = 'UNKNOWN',
    platformId = 'generic',
    statusCode = 0,
    i18nKey = 'unknown',
    detail = '',
  } = {}) {
    super(code);
    this.name = 'PlatformApiError';
    this.code = code;
    this.platformId = platformId;
    this.statusCode = statusCode;
    this.i18nKey = i18nKey;
    this.detail = detail;
  }
}

export function createPlatformApiError(payload = {}) {
  return new PlatformApiError(payload);
}

export function createClientPlatformError(code, platformId = 'generic') {
  const i18nKey = LEGACY_CLIENT_CODE_KEYS[code] || 'unknown';
  return new PlatformApiError({ code, platformId, i18nKey });
}

export function resolvePlatformIdFromEndpoint(endpoint = '') {
  const raw = String(endpoint).trim();
  if (!raw) {
    return '';
  }
  try {
    const host = new URL(raw).hostname.toLowerCase();
    if (host.includes('deepseek.com')) {
      return DEEPSEEK_PLATFORM_ID;
    }
  } catch (error) {
    if (/deepseek\.com/i.test(raw)) {
      return DEEPSEEK_PLATFORM_ID;
    }
  }
  return '';
}

export function resolvePlatformIdFromApiKey(key = {}) {
  if (!isCustomApiKey(key) && isIntegratedPlatformId(key.platformId)) {
    return key.platformId;
  }
  return (
    resolvePlatformIdFromEndpoint(key.modelsEndpoint) ||
    resolvePlatformIdFromEndpoint(key.chatEndpoint) ||
    ''
  );
}

function extractResponseErrorMessage(body = {}) {
  if (!body || typeof body !== 'object') {
    return '';
  }
  const nested = body.error;
  if (typeof nested === 'string') {
    return nested;
  }
  if (nested && typeof nested.message === 'string') {
    return nested.message;
  }
  if (typeof body.message === 'string') {
    return body.message;
  }
  return '';
}

export function createHttpPlatformError(platformId, statusCode, body) {
  const resolvedPlatformId = platformId || 'generic';
  const i18nKey = platformId
    ? mapHttpStatusToPlatformErrorKey(platformId, statusCode)
    : 'httpFallback';
  return new PlatformApiError({
    code: `HTTP_${statusCode}`,
    platformId: resolvedPlatformId,
    statusCode,
    i18nKey,
    detail: extractResponseErrorMessage(body),
  });
}

function translatePlatformMessage(platformId, i18nKey, locale, params = {}) {
  const primary = `platformErrors.${platformId}.${i18nKey}`;
  const primaryText = translate(locale, primary, params);
  if (primaryText !== primary) {
    return primaryText;
  }
  const fallback = `platformErrors.generic.${i18nKey}`;
  const fallbackText = translate(locale, fallback, params);
  if (fallbackText !== fallback) {
    return fallbackText;
  }
  return translate(locale, 'platformErrors.generic.unknown');
}

/**
 * 将平台 API 错误格式化为当前语言文案
 */
export function formatPlatformApiError(error, locale) {
  const resolvedLocale = locale || getLocale();

  if (error instanceof PlatformApiError) {
    const params = {
      status: error.statusCode || '',
      detail: error.detail || '',
    };
    return translatePlatformMessage(error.platformId, error.i18nKey, resolvedLocale, params);
  }

  const code = String(error?.code || error?.message || '').trim();
  if (!code) {
    return translate(resolvedLocale, 'platformErrors.generic.unknown');
  }

  const clientKey = LEGACY_CLIENT_CODE_KEYS[code];
  if (clientKey) {
    return translatePlatformMessage('generic', clientKey, resolvedLocale);
  }

  const legacyKey = `dataMode.modelFetchErrors.${code}`;
  const legacyText = translate(resolvedLocale, legacyKey);
  if (legacyText !== legacyKey) {
    return legacyText;
  }

  return translate(resolvedLocale, 'platformErrors.generic.unknown');
}
