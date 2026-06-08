import Vue from 'vue';
import Vuex from 'vuex';
import { DATA_MODES } from '@/constants/appMode.js';
import { THEME_MODES } from '@/constants/settings.js';
import { getStoredDataMode, isLocalMode, saveDataMode } from '@/utils/appMode.js';
import {
  applyAppPreferences,
  refreshSystemTheme as syncSystemTheme,
} from '@/utils/appPreferences.js';
import { getStoredUser } from '@/utils/auth.js';
import {
  getLocale,
  getPersonaConfig,
  getRecordExpandEnabled,
  getThemeMode,
  saveLocale,
  savePersonaConfig,
  saveRecordExpandEnabled,
  saveThemeMode,
} from '@/utils/settings.js';
import {
  getSystemTheme,
  getThemePageClass,
  getThemePalette,
  resolveThemeMode,
} from '@/utils/theme.js';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    userInfo: getStoredUser(),
    monthlyQuota: {
      tokens: 100000,
      amount: 1000,
    },
    tabBarVisible: true,
    dataMode: getStoredDataMode(),
    recordExpandEnabled: getRecordExpandEnabled(),
    personaConfig: getPersonaConfig(),
    themeMode: getThemeMode(),
    systemTheme: getSystemTheme(),
    locale: getLocale(),
    preferenceRevision: 0,
  },
  mutations: {
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo;
    },
    SET_MONTHLY_QUOTA(state, quota) {
      state.monthlyQuota = quota;
    },
    SET_TAB_BAR_VISIBLE(state, visible) {
      state.tabBarVisible = visible;
    },
    TOGGLE_TAB_BAR_VISIBLE(state) {
      state.tabBarVisible = !state.tabBarVisible;
    },
    SET_DATA_MODE(state, mode) {
      state.dataMode = mode === DATA_MODES.CLOUD ? DATA_MODES.CLOUD : DATA_MODES.LOCAL;
      saveDataMode(state.dataMode);
    },
    SET_RECORD_EXPAND_ENABLED(state, enabled) {
      state.recordExpandEnabled = !!enabled;
      saveRecordExpandEnabled(state.recordExpandEnabled);
      if (!state.recordExpandEnabled) {
        state.tabBarVisible = true;
      }
    },
    ENSURE_PERSONA_CONFIG(state) {
      if (!state.personaConfig || typeof state.personaConfig !== 'object') {
        state.personaConfig = getPersonaConfig();
      }
    },
    SET_PERSONA_CONFIG(state, patch) {
      if (!state.personaConfig || typeof state.personaConfig !== 'object') {
        state.personaConfig = getPersonaConfig();
      }
      state.personaConfig = savePersonaConfig({
        ...state.personaConfig,
        ...patch,
      });
      state.preferenceRevision += 1;
    },
    SET_THEME_MODE(state, mode) {
      state.themeMode =
        mode === THEME_MODES.LIGHT || mode === THEME_MODES.DARK ? mode : THEME_MODES.SYSTEM;
      saveThemeMode(state.themeMode);
      state.preferenceRevision += 1;
    },
    SET_SYSTEM_THEME(state, theme) {
      state.systemTheme = theme === THEME_MODES.DARK ? THEME_MODES.DARK : THEME_MODES.LIGHT;
    },
    SET_LOCALE(state, locale) {
      state.locale = saveLocale(locale);
      state.preferenceRevision += 1;
    },
    BUMP_PREFERENCE_REVISION(state) {
      state.preferenceRevision += 1;
    },
  },
  actions: {
    applyPreferences({ state }) {
      applyAppPreferences(state);
    },
    applyTheme({ state }) {
      applyAppPreferences(state);
    },
    refreshSystemTheme() {
      syncSystemTheme(this);
    },
  },
  getters: {
    resolvedPersonaConfig: (state) => {
      if (state.personaConfig && typeof state.personaConfig === 'object') {
        return state.personaConfig;
      }
      return getPersonaConfig();
    },
    isLoggedIn: (state) => !!state.userInfo,
    isLocalMode: (state) => isLocalMode(state.dataMode),
    isCloudMode: (state) => state.dataMode === DATA_MODES.CLOUD,
    resolvedTheme: (state) => resolveThemeMode(state.themeMode, state.systemTheme),
    themePageClass: (state, getters) => getThemePageClass(getters.resolvedTheme),
    themePalette: (state, getters) => getThemePalette(getters.resolvedTheme),
  },
});

store.subscribe((mutation, state) => {
  if (mutation.type === 'SET_THEME_MODE' || mutation.type === 'SET_LOCALE') {
    applyAppPreferences(state);
  }
  if (mutation.type === 'SET_LOCALE') {
    uni.$emit('app-locale-changed', state.locale);
  }
});

export default store;
