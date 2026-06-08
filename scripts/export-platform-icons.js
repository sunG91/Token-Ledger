/**
 * 导出 AI 平台品牌 SVG 到 static/icons/platforms/
 * - deepseek / claude / kimi / qwen / openrouter / gemini / mistral: simple-icons
 * - openai: @iconify-json/logos openai-icon（六瓣结形官方造型）
 * - siliconflow: 品牌色 #6E29F6 自定义流线标
 * 运行: npm run icons:export
 */
const fs = require('fs');
const path = require('path');
const si = require('simple-icons');
const logos = require('@iconify-json/logos');

const OUT_DIR = path.join(__dirname, '..', 'static', 'icons', 'platforms');

const SI_MAP = {
  deepseek: 'deepseek',
  claude: 'claude',
  kimi: 'moonshotai',
  qwen: 'qwen',
  openrouter: 'openrouter',
  gemini: 'googlegemini',
  mistral: 'mistralai',
};

/** OpenAI 品牌色（Blossom 单色常用黑/深灰，浅色底用 #000000） */
const OPENAI_COLOR = '#000000';

const CUSTOM_SVGS = {
  siliconflow: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>SiliconFlow</title><path fill="#6E29F6" d="M4.5 7.2c2.8-1.6 6.2-1.6 9 0 1.4.8 2.9 1.1 4.5 1v1.6c-1.8.2-3.5-.1-5.1-.9-2.2-1.2-4.8-1.2-7 0-1.6.8-3.3 1.1-5.1.9V8.2c1.6.1 3.1-.2 4.7-1zm0 5c2.8-1.6 6.2-1.6 9 0 1.4.8 2.9 1.1 4.5 1v1.6c-1.8.2-3.5-.1-5.1-.9-2.2-1.2-4.8-1.2-7 0-1.6.8-3.3 1.1-5.1.9v-1.6c1.6.1 3.1-.2 4.7-1zm0 5c2.8-1.6 6.2-1.6 9 0 1.4.8 2.9 1.1 4.5 1v1.6c-1.8.2-3.5-.1-5.1-.9-2.2-1.2-4.8-1.2-7 0-1.6.8-3.3 1.1-5.1.9v-1.6c1.6.1 3.1-.2 4.7-1z"/></svg>`,
};

function buildSvg(icon) {
  return `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>${icon.title}</title><path fill="#${icon.hex}" d="${icon.path}"/></svg>`;
}

function buildOpenAiSvg() {
  const icon = logos.icons.icons['openai-icon'];
  const height = icon.height || 260;
  const width = icon.width || height;
  return `<svg role="img" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><title>OpenAI</title><path fill="${OPENAI_COLOR}" d="${icon.body.match(/d="([^"]+)"/)[1]}"/></svg>`;
}

function findIcon(slug) {
  return Object.values(si).find((item) => item && item.slug === slug);
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  Object.entries(SI_MAP).forEach(([platformId, slug]) => {
    const icon = findIcon(slug);
    if (!icon) {
      console.warn(`跳过 ${platformId}: 未找到 slug=${slug}`);
      return;
    }
    fs.writeFileSync(path.join(OUT_DIR, `${platformId}.svg`), buildSvg(icon));
    console.log(`✓ ${platformId}.svg (#${icon.hex})`);
  });

  fs.writeFileSync(path.join(OUT_DIR, 'openai.svg'), buildOpenAiSvg());
  console.log(`✓ openai.svg (${OPENAI_COLOR} 六瓣结形)`);

  Object.entries(CUSTOM_SVGS).forEach(([platformId, svg]) => {
    fs.writeFileSync(path.join(OUT_DIR, `${platformId}.svg`), svg);
    console.log(`✓ ${platformId}.svg (custom)`);
  });

  console.log('\n已导出到 static/icons/platforms/');
}

main();
