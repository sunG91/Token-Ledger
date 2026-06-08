/**
 * 官方已对接平台的默认 HTTP 接口（OpenAI 兼容）
 */
export const PLATFORM_ENDPOINTS = {
  deepseek: {
    modelsEndpoint: 'https://api.deepseek.com/models',
    chatEndpoint: 'https://api.deepseek.com/chat/completions',
    /** @see https://api-docs.deepseek.com/zh-cn/api/get-user-balance */
    balanceEndpoint: 'https://api.deepseek.com/user/balance',
  },
};

export function getPlatformModelsEndpoint(platformId) {
  return PLATFORM_ENDPOINTS[platformId]?.modelsEndpoint || '';
}

export function getPlatformChatEndpoint(platformId) {
  return PLATFORM_ENDPOINTS[platformId]?.chatEndpoint || '';
}

export function getPlatformBalanceEndpoint(platformId) {
  return PLATFORM_ENDPOINTS[platformId]?.balanceEndpoint || '';
}
