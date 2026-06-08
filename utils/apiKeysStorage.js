import { getStorageItem, setStorageItem } from '@/utils/storage.js';
import { ensureDefaultUser, getStoredUser } from '@/utils/auth.js';

const API_KEYS_PREFIX = 'api_keys_';

export function getCurrentUserId() {
  const user = getStoredUser() || ensureDefaultUser();
  return user?.id || 'token_2024';
}

export function getApiKeysStorageKey(userId) {
  const id = userId || getCurrentUserId();
  return `${API_KEYS_PREFIX}${id}`;
}

export function loadApiKeysFromStorage(userId) {
  const key = getApiKeysStorageKey(userId);
  const raw = getStorageItem(key, '[]');

  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (error) {
    return [];
  }
}

export function saveApiKeysToStorage(list, userId) {
  const key = getApiKeysStorageKey(userId);
  if (!Array.isArray(list)) {
    return false;
  }
  try {
    return setStorageItem(key, JSON.stringify(list));
  } catch (error) {
    return false;
  }
}
