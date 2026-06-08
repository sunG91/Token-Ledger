/**
 * AI 平台枚举 — 手动记账 / 列表展示共用
 * 图标目录：static/icons/platforms/（PNG，与文件名一致）
 */
export const PLATFORMS = {
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    color: '#5786fe',
    bgColor: 'rgba(87, 134, 254, 0.1)',
    icon: '/static/icons/platforms/deepseek.png',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    color: '#000000',
    bgColor: 'rgba(0, 0, 0, 0.06)',
    icon: '/static/icons/platforms/openai.png',
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    color: '#d97757',
    bgColor: 'rgba(217, 119, 87, 0.1)',
    icon: '/static/icons/platforms/claude.png',
  },
  kimi: {
    id: 'kimi',
    name: 'Kimi',
    color: '#1a1a2e',
    bgColor: 'rgba(26, 26, 46, 0.08)',
    icon: '/static/icons/platforms/kimi.png',
  },
  qwen: {
    id: 'qwen',
    name: '通义千问',
    color: '#6950ef',
    bgColor: 'rgba(105, 80, 239, 0.1)',
    icon: '/static/icons/platforms/qwen.png',
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    color: '#8e75b2',
    bgColor: 'rgba(142, 117, 178, 0.12)',
    icon: '/static/icons/platforms/gemini.png',
  },
  mistral: {
    id: 'mistral',
    name: 'Mistral',
    color: '#fa520f',
    bgColor: 'rgba(250, 82, 15, 0.1)',
    icon: '/static/icons/platforms/mistral.png',
  },
  siliconflow: {
    id: 'siliconflow',
    name: '硅基流动',
    color: '#6e29f6',
    bgColor: 'rgba(110, 41, 246, 0.12)',
    icon: '/static/icons/platforms/siliconflow.png',
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    color: '#5c6b7a',
    bgColor: 'rgba(148, 163, 184, 0.14)',
    icon: '/static/icons/platforms/openrouter.png',
  },
  other: {
    id: 'other',
    name: '其他',
    color: '#636e72',
    bgColor: 'rgba(99, 110, 114, 0.12)',
    icon: '',
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    color: '#6c5ce7',
    bgColor: 'rgba(108, 92, 231, 0.12)',
    icon: '',
  },
};

export function getPlatform(id) {
  return (
    PLATFORMS[id] || {
      id,
      name: id,
      color: '#636e72',
      bgColor: 'rgba(99, 110, 114, 0.1)',
      icon: '',
    }
  );
}

/** 是否为内置已知厂商（有本地名称/图标，非「其他」） */
export function isKnownPlatformId(platformId = '') {
  const id = String(platformId || '').trim();
  if (!id || id === 'other') {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(PLATFORMS, id);
}
