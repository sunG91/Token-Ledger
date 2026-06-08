/**
 * 记录页 / 助手对话模型绑定（与本地模式配置独立）
 */
import { patchApiKeyRecord } from '@/utils/apiKeyRepository.js';
import { fetchModelList, isChatModelAvailable } from '@/utils/modelList.js';
import { resolveModelsEndpoint } from '@/utils/localModeConfig.js';
import { fetchApiKeySecretById } from '@/utils/apiKeyRepository.js';
import { resolvePlatformIdFromApiKey } from '@/utils/platformApiErrors.js';
import { isDefaultChatModelSentinel } from '@/constants/platformChatModels.js';

export async function saveChatModelBinding(payload = {}) {
  const apiKeyId = String(payload.apiKeyId || '').trim();
  const chatModel = String(payload.chatModel || '').trim();
  const modelsEndpoint = String(payload.modelsEndpoint || '').trim();

  if (!apiKeyId || !chatModel) {
    throw new Error('CHAT_MODEL_REQUIRED');
  }

  const patch = { chatModel };
  if (modelsEndpoint) {
    patch.modelsEndpoint = modelsEndpoint;
  }

  const key = await fetchApiKeySecretById(apiKeyId);
  if (!isDefaultChatModelSentinel(chatModel)) {
    const endpoint = modelsEndpoint || resolveModelsEndpoint(key);
    const platformId = resolvePlatformIdFromApiKey(key);
    const models = await fetchModelList(endpoint, key.apiKey, { platformId });
    if (!isChatModelAvailable(models, chatModel)) {
      throw new Error('MODEL_UNAVAILABLE');
    }
  }

  return patchApiKeyRecord(apiKeyId, patch);
}
