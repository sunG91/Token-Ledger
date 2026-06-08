/**
 * 设置页图标资源
 * 图标文件目录：static/icons/settings/
 */
import { resolveStaticAsset } from '@/utils/staticAsset.js';

export const SETTINGS_ICON_PATHS = {
  language: '/static/icons/settings/language.png',
  localeZh: '/static/icons/settings/locale-zh.png',
  localeEn: '/static/icons/settings/locale-en.png',
};

export function getSettingsIcon(key) {
  return resolveStaticAsset(SETTINGS_ICON_PATHS[key] || '');
}
