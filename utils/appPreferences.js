import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';
import { LOCALE_CODES, THEME_MODES } from '@/constants/settings.js';
import {
  applyGlobalTheme,
  getSystemTheme,
  resolveThemeMode,
  watchSystemThemeChange,
} from '@/utils/theme.js';

let systemThemeWatcher = null;

function getDayjsLocale(locale) {
  return locale === LOCALE_CODES.EN ? 'en' : 'zh-cn';
}

export function applyLocale(locale) {
  const nextLocale = locale === LOCALE_CODES.EN ? LOCALE_CODES.EN : LOCALE_CODES.ZH;
  dayjs.locale(getDayjsLocale(nextLocale));

  // #ifdef H5
  if (typeof document !== 'undefined') {
    document.documentElement.lang = nextLocale === LOCALE_CODES.EN ? 'en' : 'zh-CN';
    document.documentElement.setAttribute('data-locale', nextLocale);
  }
  // #endif

  return nextLocale;
}

export function applyTheme(themeMode, systemTheme) {
  const resolvedTheme = resolveThemeMode(themeMode, systemTheme);
  applyGlobalTheme(resolvedTheme);
  return resolvedTheme;
}

export function applyAppPreferences(state) {
  if (!state) {
    return;
  }
  applyTheme(state.themeMode, state.systemTheme);
  applyLocale(state.locale);
}

export function refreshSystemTheme(store) {
  if (!store) {
    return getSystemTheme();
  }

  const nextTheme = getSystemTheme();
  const changed = store.state.systemTheme !== nextTheme;

  if (changed) {
    store.commit('SET_SYSTEM_THEME', nextTheme);
  }

  if (store.state.themeMode === THEME_MODES.SYSTEM) {
    applyTheme(store.state.themeMode, nextTheme);
    if (changed) {
      store.commit('BUMP_PREFERENCE_REVISION');
    }
  }

  return nextTheme;
}

export function initAppPreferences(store) {
  if (!store) {
    return;
  }

  refreshSystemTheme(store);
  applyLocale(store.state.locale);

  if (systemThemeWatcher) {
    return;
  }

  systemThemeWatcher = watchSystemThemeChange(() => {
    refreshSystemTheme(store);
  });
}
