import {
  DEEPSEEK_HTTP_STATUS_KEYS,
  DEEPSEEK_PLATFORM_ID,
} from '@/constants/platformErrors/deepseek.js';

/** 已对接官方平台的 HTTP 状态码映射 */
export const PLATFORM_HTTP_STATUS_MAP = {
  [DEEPSEEK_PLATFORM_ID]: DEEPSEEK_HTTP_STATUS_KEYS,
};

export function mapHttpStatusToPlatformErrorKey(platformId, statusCode) {
  const table = PLATFORM_HTTP_STATUS_MAP[platformId];
  if (table && table[statusCode]) {
    return table[statusCode];
  }
  return 'httpFallback';
}
