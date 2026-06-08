/**
 * DeepSeek 官方 API 错误码
 * @see https://api-docs.deepseek.com/zh-cn/quick_start/error_codes
 */
export const DEEPSEEK_PLATFORM_ID = 'deepseek';

/** HTTP 状态码 → i18n key（platformErrors.deepseek.*） */
export const DEEPSEEK_HTTP_STATUS_KEYS = {
  400: 'badRequest',
  401: 'unauthorized',
  402: 'insufficientBalance',
  422: 'invalidParams',
  429: 'rateLimited',
  500: 'serverError',
  503: 'serviceUnavailable',
};

export const DEEPSEEK_DOCS_ERROR_CODES_URL =
  'https://api-docs.deepseek.com/zh-cn/quick_start/error_codes';
