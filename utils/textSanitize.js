/**
 * 文本清洗（表格等场景：去表情、去多余空白）
 */
const EMOJI_RE =
  /(?:\u200D|[\u2600-\u27BF]|[\uFE00-\uFE0F]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDC00-\uDEFF])/g;

export function stripEmoji(text = '') {
  return String(text || '')
    .replace(EMOJI_RE, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function sanitizeTableCellText(text = '') {
  return stripEmoji(text);
}
