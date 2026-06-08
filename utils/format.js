/**
 * 数字与金额格式化
 */

/** 千分位整数，如 12450 -> 12,450 */
export function formatToken(value) {
  const num = Number(value) || 0;
  return num.toLocaleString('en-US');
}

/** 金额保留两位小数 */
export function formatAmount(value) {
  const num = Number(value) || 0;
  return num.toFixed(2);
}

const CURRENCY_SYMBOLS = {
  CNY: '¥',
  USD: '$',
};

/** 官方余额展示，如 234.5 + CNY -> ¥234.50 */
export function formatOfficialBalance(amount, currency = 'CNY') {
  const symbol = CURRENCY_SYMBOLS[currency] || `${currency} `;
  return `${symbol}${formatAmount(amount)}`;
}
