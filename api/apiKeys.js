/**
 * API Key 管理接口
 */
import http from '@/utils/request.js';
import config from '@/config/index.js';
import {
  createApiKeyRecord,
  deleteApiKeyRecord,
  fetchApiKeyRecordById,
  fetchApiKeyRecords,
  patchApiKeyRecord,
} from '@/utils/apiKeyRepository.js';

function normalizeApiKeyItem(item = {}) {
  return {
    ...item,
    officialBalance: item.official_balance ?? item.officialBalance ?? null,
    balanceCurrency: item.balance_currency ?? item.balanceCurrency ?? 'CNY',
    storageType: item.storage_type ?? item.storageType ?? 'local',
    providerType: item.provider_type ?? item.providerType ?? 'builtin',
    chatEndpoint: item.chat_endpoint ?? item.chatEndpoint ?? '',
    balanceEndpoint: item.balance_endpoint ?? item.balanceEndpoint ?? '',
    modelsEndpoint: item.models_endpoint ?? item.modelsEndpoint ?? '',
    chatModel: item.chat_model ?? item.chatModel ?? '',
    logoUrl: item.logo_url ?? item.logoUrl ?? '',
    cloudRecordId: item.cloud_record_id ?? item.cloudRecordId ?? '',
  };
}

export async function fetchApiKeys() {
  if (config.useMock) {
    return fetchApiKeyRecords();
  }

  const res = await http.get('/api-keys');
  const items = res.data?.items || res.data || [];
  return items.map(normalizeApiKeyItem);
}

export async function fetchApiKeyById(id) {
  if (config.useMock) {
    return fetchApiKeyRecordById(id);
  }

  const res = await http.get(`/api-keys/${id}`);
  return normalizeApiKeyItem(res.data);
}

export async function createApiKey(payload) {
  if (config.useMock) {
    return createApiKeyRecord(payload);
  }

  const res = await http.post('/api-keys', payload);
  return normalizeApiKeyItem(res.data);
}

export async function updateApiKeyEnabled(id, enabled) {
  if (config.useMock) {
    return patchApiKeyRecord(id, { enabled });
  }

  const res = await http.patch(`/api-keys/${id}`, { enabled });
  return normalizeApiKeyItem(res.data);
}

export async function updateApiKey(id, patch) {
  if (config.useMock) {
    return patchApiKeyRecord(id, patch);
  }

  const res = await http.patch(`/api-keys/${id}`, patch);
  return normalizeApiKeyItem(res.data);
}

/**
 * 删除 API Key
 * @param {string} id
 * @param {{ deleteLocal?: boolean, deleteCloud?: boolean }} options
 */
export async function deleteApiKey(id, options = {}) {
  if (config.useMock) {
    return deleteApiKeyRecord(id, options);
  }

  await http.delete(`/api-keys/${id}`, { data: options });
  return { mode: 'full' };
}
