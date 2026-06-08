/**
 * 助手可用模型 — 来源于用户已对接且启用的 API Key
 */
import { fetchApiKeys } from '@/api/apiKeys.js';
import { DATA_MODES } from '@/constants/appMode.js';
import { DEFAULT_CHAT_MODEL_SENTINEL } from '@/constants/platformChatModels.js';
import { isIntegratedPlatformId } from '@/constants/integratedPlatforms.js';
import { getStoredDataMode } from '@/utils/appMode.js';
import {
  apiKeyToBoundModel,
  buildBoundModelsFromApiKeys,
  createOfficialDefaultBoundModel,
} from '@/utils/boundModels.js';
import { getLocalModeConfig } from '@/utils/localModeConfig.js';

function findIntegratedKey(keys = []) {
  return keys.find((item) => isIntegratedPlatformId(item.platformId) && item.enabled !== false);
}

function enrichCloudBoundModels(keys = [], models = []) {
  const integratedKey = findIntegratedKey(keys);
  let result = [...models];

  if (!result.length) {
    return [createOfficialDefaultBoundModel(integratedKey || null)];
  }

  if (integratedKey && !result.some((item) => item.apiKeyId === integratedKey.id)) {
    result.unshift(
      apiKeyToBoundModel(
        {
          ...integratedKey,
          chatModel: integratedKey.chatModel || DEFAULT_CHAT_MODEL_SENTINEL,
        },
        0
      )
    );
  }

  let defaultModel = result.find((item) => item.useDefaultIcon);
  if (!defaultModel && integratedKey) {
    defaultModel = createOfficialDefaultBoundModel(integratedKey);
    result = [defaultModel, ...result];
    return result;
  }

  if (defaultModel) {
    const others = result.filter((item) => item.id !== defaultModel.id);
    return [defaultModel, ...others];
  }

  return result;
}

function resolveLocalBoundModels(keys = [], models = []) {
  const { apiKeyId } = getLocalModeConfig();
  if (!apiKeyId) {
    return [];
  }

  let filtered = models.filter((item) => item.apiKeyId === apiKeyId);
  if (filtered.length) {
    return filtered;
  }

  const key = keys.find((item) => item.id === apiKeyId && item.enabled !== false);
  if (!key) {
    return [];
  }

  return [
    apiKeyToBoundModel(
      {
        ...key,
        chatModel: key.chatModel || DEFAULT_CHAT_MODEL_SENTINEL,
      },
      0
    ),
  ];
}

export async function fetchBoundModels() {
  const keys = await fetchApiKeys();
  let models = buildBoundModelsFromApiKeys(keys);

  if (getStoredDataMode() === DATA_MODES.LOCAL) {
    models = resolveLocalBoundModels(keys, models);
  } else {
    models = enrichCloudBoundModels(keys, models);
  }

  return models;
}
