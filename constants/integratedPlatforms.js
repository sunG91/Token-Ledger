/**
 * 已对接的官方厂商（API Key「官方」类型可选）
 * 新增对接时在此追加 id，并在 platforms.js 中确保有对应图标
 */
import { getPlatform } from '@/constants/platforms.js';

export const INTEGRATED_PLATFORM_IDS = ['deepseek'];

/** 自定义 Key 图标：其他（非官方厂商） */
export const LOGO_OTHER_PLATFORM_ID = 'other';

/** 自定义 Key 可选 Logo（9 个厂商/中转 + 其他） */
export const LOGO_PICKABLE_PLATFORM_IDS = [
  'deepseek',
  'openai',
  'claude',
  'kimi',
  'qwen',
  'gemini',
  'mistral',
  'siliconflow',
  'openrouter',
  LOGO_OTHER_PLATFORM_ID,
];

export function getDefaultIntegratedPlatformId() {
  return INTEGRATED_PLATFORM_IDS[0] || 'deepseek';
}

export function isIntegratedPlatformId(platformId) {
  return INTEGRATED_PLATFORM_IDS.includes(platformId);
}

export function getIntegratedPlatforms() {
  return INTEGRATED_PLATFORM_IDS.map((id) => getPlatform(id));
}

export function showIntegratedPlatformSwitcher() {
  return INTEGRATED_PLATFORM_IDS.length > 1;
}
