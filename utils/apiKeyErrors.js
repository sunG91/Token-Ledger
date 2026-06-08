import { translate } from '@/i18n/index.js';
import { getLocale } from '@/utils/settings.js';

export const API_KEY_ERROR = {
  NOT_FOUND: 'NOT_FOUND',
  KEY_REQUIRED: 'KEY_REQUIRED',
  NAME_REQUIRED: 'NAME_REQUIRED',
  INVALID_CHAT_ENDPOINT: 'INVALID_CHAT_ENDPOINT',
  INVALID_BALANCE_ENDPOINT: 'INVALID_BALANCE_ENDPOINT',
  INVALID_MODELS_ENDPOINT: 'INVALID_MODELS_ENDPOINT',
  CHAT_MODEL_REQUIRED: 'CHAT_MODEL_REQUIRED',
  STORAGE_SAVE_FAILED: 'STORAGE_SAVE_FAILED',
};

export function createApiKeyError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

export function getApiKeyErrorMessage(code, locale) {
  const resolvedLocale = locale || getLocale();
  if (!code) {
    return translate(resolvedLocale, 'apiKeys.actionFail');
  }
  const messageKey = `apiKeys.errors.${code}`;
  const message = translate(resolvedLocale, messageKey);
  return message === messageKey
    ? translate(resolvedLocale, 'apiKeys.actionFail')
    : message;
}
