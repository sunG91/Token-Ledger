/**
 * 兼容层：API Key 数据已迁至 utils/apiKeyRepository.js（本地真实 storage）
 */
export {
  createApiKeyRecord as createMockApiKey,
  deleteApiKeyRecord as deleteMockApiKey,
  fetchApiKeyRecordById as fetchMockApiKeyById,
  fetchApiKeyRecords as fetchMockApiKeys,
  patchApiKeyRecord as patchMockApiKey,
} from '@/utils/apiKeyRepository.js';
