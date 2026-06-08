/**
 * 数据模式读写 — 本地持久化，供 API 层后续切换数据源
 */
import { DATA_MODES, DATA_MODE_STORAGE_KEY } from '@/constants/appMode.js';
import { translate } from '@/i18n/index.js';
import { getLocale } from '@/utils/settings.js';

export function getStoredDataMode() {
  const mode = uni.getStorageSync(DATA_MODE_STORAGE_KEY);
  return mode === DATA_MODES.CLOUD ? DATA_MODES.CLOUD : DATA_MODES.LOCAL;
}

export function saveDataMode(mode) {
  uni.setStorageSync(DATA_MODE_STORAGE_KEY, mode);
}

export function isLocalMode(mode) {
  return mode !== DATA_MODES.CLOUD;
}

export function getDataModeLabel(mode) {
  const locale = getLocale();
  const key = mode === DATA_MODES.CLOUD ? 'dataMode.cloud' : 'dataMode.local';
  return translate(locale, key);
}
