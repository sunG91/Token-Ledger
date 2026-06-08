import { translate } from '@/i18n/index.js';
import { getLocale } from '@/utils/settings.js';

const LONG_TERM_VALUES = new Set(['长期有效', 'long_term', 'no_expiry']);

function t(key, params) {
  return translate(getLocale(), key, params);
}

export function getApiKeyDefaultAlias() {
  return t('apiKeys.defaultAlias');
}

export function getApiKeyPlatformLabel() {
  return t('apiKeys.platformName');
}

export function getOfficialProviderLabel(platformName = '') {
  const name = String(platformName).trim();
  if (!name) {
    return t('apiKeys.official');
  }
  return t('apiKeys.officialProvider', { name });
}

export function getCustomProviderLabel() {
  return t('apiKeys.custom');
}

export function getCustomDefaultAlias() {
  return t('apiKeys.customDefaultAlias');
}

export function formatApiKeyExpireDate(value) {
  if (!value || LONG_TERM_VALUES.has(value)) {
    return t('apiKeys.noExpiry');
  }
  return value;
}

export function getApiKeyNoExpiryValue() {
  return 'long_term';
}
