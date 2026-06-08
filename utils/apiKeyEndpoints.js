import {
  getPlatformBalanceEndpoint,
  getPlatformChatEndpoint,
  getPlatformModelsEndpoint,
} from '@/constants/platformEndpoints.js';
import { isIntegratedPlatformId } from '@/constants/integratedPlatforms.js';
import { isCustomApiKey } from '@/utils/apiKey.js';

export function resolveModelsEndpoint(key = {}) {
  const custom = String(key.modelsEndpoint || '').trim();
  if (custom) {
    return custom;
  }
  if (isCustomApiKey(key)) {
    return '';
  }
  if (isIntegratedPlatformId(key.platformId)) {
    return getPlatformModelsEndpoint(key.platformId);
  }
  return '';
}

export function resolveBalanceEndpoint(key = {}) {
  const custom = String(key.balanceEndpoint || '').trim();
  if (custom) {
    return custom;
  }
  if (isCustomApiKey(key)) {
    return '';
  }
  if (isIntegratedPlatformId(key.platformId)) {
    return getPlatformBalanceEndpoint(key.platformId);
  }
  return '';
}

export function resolveChatEndpoint(key = {}) {
  const custom = String(key.chatEndpoint || '').trim();
  if (custom) {
    return custom;
  }
  if (isCustomApiKey(key)) {
    return '';
  }
  if (isIntegratedPlatformId(key.platformId)) {
    return getPlatformChatEndpoint(key.platformId);
  }
  return '';
}
