/**
 * 口语记账：厂商解析（已知平台 vs 其他）
 */
import { getPlatform, isKnownPlatformId } from '@/constants/platforms.js';
import { resolvePlatformIdFromText } from '@/utils/bookkeeping/platformMatch.js';

function buildPlatformHint(args = {}) {
  return [args.platform_name, args.user_description, args.scenario, args.model_name]
    .filter(Boolean)
    .join(' ');
}

/**
 * 解析入账厂商：本地有图标用真实 platformId，否则 other 并保留用户称呼
 */
export function resolveRecordPlatformFromArgs(args = {}) {
  const hint = buildPlatformHint(args);
  let platformId = String(args.platform_id || '').trim();

  if (!platformId || platformId === 'other' || !isKnownPlatformId(platformId)) {
    const fromText = resolvePlatformIdFromText(hint);
    platformId = fromText && isKnownPlatformId(fromText) ? fromText : 'other';
  }

  let platformName = String(args.platform_name || '').trim();
  const modelName = String(args.model_name || '').trim();

  if (platformId === 'other') {
    platformName =
      platformName || modelName || hint.trim().slice(0, 32) || getPlatform('other').name;
  } else {
    platformName = platformName || getPlatform(platformId).name;
  }

  return {
    platformId,
    platformName,
    modelName,
  };
}
