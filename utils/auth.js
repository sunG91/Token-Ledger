import { SETTINGS_STORAGE_KEYS } from '@/constants/settings.js';

const DEFAULT_USER = {
  id: 'token_2024',
  nickname: '小记账本',
  avatarEmoji: '📒',
  isPro: true,
};

export function getStoredUser() {
  const user = uni.getStorageSync(SETTINGS_STORAGE_KEYS.USER_INFO);
  return user && user.id ? user : null;
}

export function ensureDefaultUser() {
  const existing = getStoredUser();
  if (existing) {
    return existing;
  }
  saveUser(DEFAULT_USER);
  return { ...DEFAULT_USER };
}

export function saveUser(user) {
  uni.setStorageSync(SETTINGS_STORAGE_KEYS.USER_INFO, user);
}

export function clearAuth() {
  uni.removeStorageSync(SETTINGS_STORAGE_KEYS.USER_INFO);
  uni.removeStorageSync(SETTINGS_STORAGE_KEYS.AUTH_TOKEN);
}
