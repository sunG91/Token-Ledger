/**
 * 从 OpenAI 兼容 GET /models 接口拉取模型列表
 * 参考：https://api-docs.deepseek.com/zh-cn/api/list-models
 */
import {
  PLATFORM_API_ERROR,
  createClientPlatformError,
  createHttpPlatformError,
  createPlatformApiError,
  resolvePlatformIdFromEndpoint,
} from '@/utils/platformApiErrors.js';

const REQUEST_TIMEOUT_MS = 20000;

function normalizeModelEntry(entry = {}) {
  const id = String(entry.id || entry.model || entry.name || '').trim();
  if (!id) {
    return null;
  }
  return {
    id,
    object: entry.object || 'model',
    ownedBy: entry.owned_by || entry.ownedBy || '',
  };
}

export function parseModelListResponse(payload = {}) {
  const rawList = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.models)
      ? payload.models
      : Array.isArray(payload)
        ? payload
        : [];

  const seen = new Set();
  const models = [];

  rawList.forEach((entry) => {
    const normalized = normalizeModelEntry(entry);
    if (!normalized || seen.has(normalized.id)) {
      return;
    }
    seen.add(normalized.id);
    models.push(normalized);
  });

  return models;
}

/**
 * @param {string} endpoint
 * @param {string} apiKey
 * @param {{ platformId?: string }} [options]
 */
export function fetchModelList(endpoint, apiKey, options = {}) {
  const url = String(endpoint || '').trim();
  const key = String(apiKey || '').trim();
  const platformId = options.platformId || resolvePlatformIdFromEndpoint(url) || 'generic';

  if (!url) {
    return Promise.reject(
      createClientPlatformError(PLATFORM_API_ERROR.MODELS_ENDPOINT_REQUIRED, platformId),
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
        const models = parseModelListResponse(res.data);
        if (!models.length) {
          reject(
            createClientPlatformError(PLATFORM_API_ERROR.MODEL_LIST_EMPTY, platformId),
          );
          return;
        }
        resolve(models);
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

export function isChatModelAvailable(models = [], chatModel = '') {
  const target = String(chatModel || '').trim();
  if (!target) {
    return false;
  }
  return models.some((item) => item.id === target);
}
