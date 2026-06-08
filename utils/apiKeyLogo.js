/**
 * API Key Logo：平台 id 编码存储（platform:deepseek），不再上传图片
 */
import { getPlatform } from '@/constants/platforms.js';

const LOGO_PREFIX = 'platform:';

export function encodePlatformLogo(platformId = '') {
  const raw = String(platformId).trim();
  if (!raw) {
    return '';
  }
  if (raw.startsWith(LOGO_PREFIX)) {
    return raw;
  }
  return `${LOGO_PREFIX}${raw}`;
}

export function decodePlatformLogo(value = '') {
  const trimmed = String(value).trim();
  if (!trimmed.startsWith(LOGO_PREFIX)) {
    return '';
  }
  return trimmed.slice(LOGO_PREFIX.length);
}

export function isEncodedPlatformLogo(value = '') {
  return String(value).trim().startsWith(LOGO_PREFIX);
}

export function isLegacyUploadedLogo(value = '') {
  const trimmed = String(value).trim();
  if (!trimmed || isEncodedPlatformLogo(trimmed)) {
    return false;
  }
  return (
    trimmed.startsWith('file://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.includes('_doc') ||
    trimmed.includes('wxfile://')
  );
}

/**
 * 解析条目应展示的平台 Logo id
 */
export function resolveApiKeyLogoPlatformId(item = {}) {
  const encoded = decodePlatformLogo(item.logoUrl);
  if (encoded) {
    return encoded;
  }
  if (item.platformId && item.platformId !== 'custom') {
    return item.platformId;
  }
  return '';
}

export function resolveApiKeyLogoPlatform(item = {}) {
  const platformId = resolveApiKeyLogoPlatformId(item);
  return platformId ? getPlatform(platformId) : null;
}

export function removeApiKeyLogo(logoUrl) {
  if (!isLegacyUploadedLogo(logoUrl)) {
    return;
  }

  // #ifndef H5
  try {
    uni.removeSavedFile({
      filePath: logoUrl,
      fail() {},
    });
  } catch (error) {
    // ignore
  }
  // #endif
}
