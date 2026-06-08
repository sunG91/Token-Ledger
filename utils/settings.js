import { LOCALE_CODES, SETTINGS_STORAGE_KEYS, THEME_MODES } from '@/constants/settings.js';
import { getStorageItem, readBoolean, setStorageItem } from '@/utils/storage.js';

export function getRecordExpandEnabled() {
  const value = getStorageItem(SETTINGS_STORAGE_KEYS.RECORD_EXPAND, '');
  return readBoolean(value, true);
}

export function saveRecordExpandEnabled(enabled) {
  setStorageItem(SETTINGS_STORAGE_KEYS.RECORD_EXPAND, !!enabled);
}

export function getThemeMode() {
  const mode = getStorageItem(SETTINGS_STORAGE_KEYS.THEME, THEME_MODES.SYSTEM);
  if (mode === THEME_MODES.LIGHT || mode === THEME_MODES.DARK) {
    return mode;
  }
  return THEME_MODES.SYSTEM;
}

export function saveThemeMode(mode) {
  const nextMode =
    mode === THEME_MODES.LIGHT || mode === THEME_MODES.DARK ? mode : THEME_MODES.SYSTEM;
  setStorageItem(SETTINGS_STORAGE_KEYS.THEME, nextMode);
  return nextMode;
}

export function getLocale() {
  const locale = getStorageItem(SETTINGS_STORAGE_KEYS.LOCALE, LOCALE_CODES.ZH);
  return locale === LOCALE_CODES.EN ? LOCALE_CODES.EN : LOCALE_CODES.ZH;
}

export function saveLocale(locale) {
  const nextLocale = locale === LOCALE_CODES.EN ? LOCALE_CODES.EN : LOCALE_CODES.ZH;
  setStorageItem(SETTINGS_STORAGE_KEYS.LOCALE, nextLocale);
  return nextLocale;
}

export { getPersonaConfig, savePersonaConfig } from '@/utils/personaConfig.js';
