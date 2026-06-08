/**
 * 我的页图标资源
 * 图标文件目录：static/icons/profile/
 */
import { resolveStaticAsset } from '@/utils/staticAsset.js';

export const PROFILE_ICON_PATHS = {
  memberCrown: '/static/icons/profile/member-crown.png',
  memberStatus: '/static/icons/profile/member-status.png',
  memberVip: '/static/icons/profile/member-vip.png',
  dataBackup: '/static/icons/profile/data-backup.png',
  cloudSync: '/static/icons/profile/cloud-sync.png',
  memberBenefits: '/static/icons/profile/member-benefits.png',
  apiKey: '/static/icons/profile/api-key.png',
  settings: '/static/icons/profile/settings.png',
  savingsBg: '/static/icons/profile/savings-bg.png',
};

export function getProfileIcon(key) {
  return resolveStaticAsset(PROFILE_ICON_PATHS[key] || '');
}
