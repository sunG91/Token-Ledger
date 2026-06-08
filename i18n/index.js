import zhCN from '@/i18n/locales/zh-CN.js';
import enUS from '@/i18n/locales/en-US.js';
import { LOCALE_CODES } from '@/constants/settings.js';

const MESSAGE_MAP = {
  [LOCALE_CODES.ZH]: zhCN,
  [LOCALE_CODES.EN]: enUS,
};

function getByPath(obj, path) {
  return path.split('.').reduce((current, key) => {
    if (current && Object.prototype.hasOwnProperty.call(current, key)) {
      return current[key];
    }
    return undefined;
  }, obj);
}

function formatMessage(message, params = {}) {
  if (typeof message !== 'string') {
    return message;
  }
  return message.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`;
  });
}

export function translate(locale, key, params) {
  const messages = MESSAGE_MAP[locale] || MESSAGE_MAP[LOCALE_CODES.ZH];
  const value = getByPath(messages, key);
  if (value === undefined) {
    return key;
  }
  if (Array.isArray(value)) {
    return value;
  }
  return formatMessage(value, params);
}

export function createI18nPlugin(getState) {
  return {
    install(Vue) {
      Vue.prototype.$t = function $t(key, params) {
        const state = typeof getState === 'function' ? getState() : null;
        const locale = state?.locale || LOCALE_CODES.ZH;
        void state?.revision;
        return translate(locale, key, params);
      };
    },
  };
}
