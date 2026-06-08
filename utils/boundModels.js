import { getPlatform } from '@/constants/platforms.js';
import { isIntegratedPlatformId } from '@/constants/integratedPlatforms.js';
import { isCustomApiKey } from '@/utils/apiKey.js';
import { getCustomDefaultAlias } from '@/utils/apiKeyDisplay.js';
import { encodePlatformLogo, resolveApiKeyLogoPlatformId } from '@/utils/apiKeyLogo.js';
import { LOGO_OTHER_PLATFORM_ID } from '@/constants/integratedPlatforms.js';
import {
  DEFAULT_CHAT_MODEL_SENTINEL,
  isDefaultChatModelSentinel,
  resolveChatModelId,
} from '@/constants/platformChatModels.js';

export function isAssistantEligibleApiKey(key = {}) {
  if (key.enabled === false) {
    return false;
  }
  const chatModel = String(key.chatModel || '').trim();
  if (!chatModel) {
    if (isIntegratedPlatformId(key.platformId) && resolveChatModelId(key.platformId, '')) {
      // 官方平台可使用内置默认对话模型
    } else {
      return false;
    }
  }
  if (isCustomApiKey(key)) {
    return !!(
      String(key.chatEndpoint || '').trim() &&
      String(key.balanceEndpoint || '').trim() &&
      String(key.modelsEndpoint || '').trim()
    );
  }
  return isIntegratedPlatformId(key.platformId);
}

function resolveAlias(key = {}) {
  const alias = String(key.alias || '').trim();
  if (alias) {
    return alias;
  }
  if (isCustomApiKey(key)) {
    return getCustomDefaultAlias();
  }
  return getPlatform(key.platformId).name;
}

function resolveModelName(key = {}) {
  const chatModel = String(key.chatModel || '').trim();
  if (!chatModel || isDefaultChatModelSentinel(chatModel)) {
    return DEFAULT_CHAT_MODEL_SENTINEL;
  }
  return chatModel;
}

export function isUsingDefaultChatModel(key = {}) {
  const chatModel = String(key.chatModel || '').trim();
  return !chatModel || isDefaultChatModelSentinel(chatModel);
}

export function apiKeyToBoundModel(key = {}, index = 0) {
  const logoPlatformId = resolveApiKeyLogoPlatformId(key);
  const useDefaultIcon = isUsingDefaultChatModel(key);
  const item = {
    platformId: useDefaultIcon ? '' : key.platformId,
    logoUrl: key.logoUrl || '',
    providerType: key.providerType,
    useDefaultIcon,
  };

  return {
    id: key.id,
    apiKeyId: key.id,
    platformId: logoPlatformId || key.platformId || 'other',
    modelName: resolveModelName(key),
    alias: resolveAlias(key),
    isDefault: index === 0,
    useDefaultIcon,
    item,
  };
}

export function buildBoundModelsFromApiKeys(keys = []) {
  const eligible = keys.filter(isAssistantEligibleApiKey);
  return eligible.map((key, index) => apiKeyToBoundModel(key, index));
}

export function createOfficialDefaultBoundModel(key = null) {
  if (key?.id) {
    const bound = apiKeyToBoundModel(
      {
        ...key,
        chatModel: DEFAULT_CHAT_MODEL_SENTINEL,
      },
      0
    );
    return {
      ...bound,
      id: `${key.id}__official_default`,
      isDefault: true,
      useDefaultIcon: true,
      item: {
        platformId: '',
        logoUrl: key.logoUrl || '',
        providerType: key.providerType,
        useDefaultIcon: true,
      },
    };
  }

  return {
    id: 'official-default',
    apiKeyId: '',
    platformId: 'deepseek',
    modelName: DEFAULT_CHAT_MODEL_SENTINEL,
    alias: '',
    isDefault: true,
    useDefaultIcon: true,
    isVirtualDefault: true,
    empty: true,
    item: {
      platformId: '',
      useDefaultIcon: true,
      providerType: 'builtin',
    },
  };
}

export function getDefaultBoundModel(models = []) {
  if (!models.length) {
    return createEmptyBoundModel();
  }
  return (
    models.find((item) => item.useDefaultIcon && item.isDefault) ||
    models.find((item) => item.useDefaultIcon) ||
    models.find((item) => item.isDefault) ||
    models[0]
  );
}

export function syncBoundModelSelection(models = [], currentModel = null) {
  if (!models.length) {
    return createEmptyBoundModel();
  }
  if (currentModel?.apiKeyId) {
    const matched = models.find((item) => item.id === currentModel.id);
    if (matched) {
      return matched;
    }
  }
  return getDefaultBoundModel(models);
}

export function createEmptyBoundModel() {
  return {
    id: '',
    apiKeyId: '',
    platformId: 'other',
    modelName: '',
    alias: '',
    isDefault: false,
    empty: true,
    item: {
      platformId: 'custom',
      logoUrl: encodePlatformLogo(LOGO_OTHER_PLATFORM_ID),
      providerType: 'custom',
    },
  };
}
