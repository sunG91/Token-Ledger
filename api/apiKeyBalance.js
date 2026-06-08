/**
 * API Key 余额同步
 */
import config from '@/config/index.js';
import { fetchApiKeySecretById, patchApiKeyRecord } from '@/utils/apiKeyRepository.js';
import { resolveBalanceEndpoint } from '@/utils/apiKeyEndpoints.js';
import { fetchPlatformBalance } from '@/utils/platformBalance.js';
import {
  PLATFORM_API_ERROR,
  createClientPlatformError,
  resolvePlatformIdFromApiKey,
} from '@/utils/platformApiErrors.js';
import {
  applyCostCalibrationAfterBalanceSync,
  resolveChatModelContext,
} from '@/utils/assistant/costCalibrator.js';

export const API_KEY_BALANCE_SYNCED_EVENT = 'api-key-balance-synced';

export async function canSyncApiKeyBalance(id) {
  const keyId = String(id || '').trim();
  if (!keyId) {
    return false;
  }
  try {
    const key = await fetchApiKeySecretById(keyId);
    return !!resolveBalanceEndpoint(key);
  } catch (error) {
    return false;
  }
}

async function syncApiKeyBalanceLocal(id) {
  const key = await fetchApiKeySecretById(id);
  const endpoint = resolveBalanceEndpoint(key);
  if (!endpoint) {
    throw createClientPlatformError(
      PLATFORM_API_ERROR.BALANCE_ENDPOINT_REQUIRED,
      resolvePlatformIdFromApiKey(key)
    );
  }

  const platformId = resolvePlatformIdFromApiKey(key);
  const balance = await fetchPlatformBalance(endpoint, key.apiKey, { platformId });

  const patch = {
    officialBalance: balance.officialBalance,
    balanceCurrency: balance.balanceCurrency,
  };
  if (typeof balance.isAvailable === 'boolean') {
    patch.activated = balance.isAvailable;
  }

  return patchApiKeyRecord(id, patch);
}

export async function syncApiKeyBalance(id) {
  if (config.useMock) {
    return syncApiKeyBalanceLocal(id);
  }

  // 云端模式后续走服务端代理；当前与本地模式一致直连厂商
  return syncApiKeyBalanceLocal(id);
}

/**
 * 对话结束后静默同步余额，并运行内置金额换算校准（用户不可见）
 * @param {string} id
 * @param {{ usage?: object }} [options]
 */
export async function syncApiKeyBalanceAfterChat(id, options = {}) {
  const keyId = String(id || '').trim();
  if (!keyId) {
    return null;
  }

  const syncable = await canSyncApiKeyBalance(keyId);
  if (!syncable) {
    return null;
  }

  try {
    const chatContext = await resolveChatModelContext(keyId);
    const previousBalance = chatContext?.lastBalance ?? null;
    const record = await syncApiKeyBalance(keyId);

    if (options.usage && chatContext) {
      await applyCostCalibrationAfterBalanceSync({
        apiKeyId: keyId,
        platformId: chatContext.platformId,
        modelName: chatContext.modelName,
        balanceCurrency: record.balanceCurrency || chatContext.balanceCurrency,
        previousBalance,
        newBalance: record.officialBalance,
        usage: options.usage,
      });
    }

    uni.$emit(API_KEY_BALANCE_SYNCED_EVENT, {
      apiKeyId: keyId,
      record,
    });
    return record;
  } catch (error) {
    return null;
  }
}
