/**
 * 账单时间筛选解析
 */
import dayjs from 'dayjs';
import { LOCALE_CODES } from '@/constants/settings.js';
import { translate } from '@/i18n/index.js';
import { getLocale } from '@/utils/settings.js';

const BILL_TIME_VALUE_KEYS = {
  all: 'bills.all',
  this_month: 'bills.thisMonth',
  last_month: 'bills.lastMonth',
  last_3_months: 'bills.last3Months',
};

function t(key, params) {
  return translate(getLocale(), key, params);
}

export function getBillTimeOptionLabel(value) {
  return t(BILL_TIME_VALUE_KEYS[value] || 'bills.thisMonth');
}

/** 时间下拉展示文案 */
export function getBillTimeDisplayLabel(timeValue, customTime) {
  if (customTime?.label) return customTime.label;
  return getBillTimeOptionLabel(timeValue);
}

/** 生成年份列表 */
export function getBillYearRange(startOffset = 5, endOffset = 1) {
  const currentYear = dayjs().year();
  const years = [];
  for (let year = currentYear - startOffset; year <= currentYear + endOffset; year += 1) {
    years.push(year);
  }
  return years;
}

/** 构造日历自定义时间 */
export function createCustomBillTime({ mode, year, month }) {
  const yearStr = String(year);
  const locale = getLocale();
  if (mode === 'year') {
    return {
      mode: 'year',
      year: yearStr,
      label:
        locale === LOCALE_CODES.EN ? yearStr : `${yearStr}${t('bills.yearSuffix')}`,
    };
  }

  const monthNum = Number(month);
  const monthStr = String(monthNum).padStart(2, '0');
  const label =
    locale === LOCALE_CODES.EN
      ? dayjs(`${yearStr}-${monthStr}-01`).format('MMM YYYY')
      : `${yearStr}${t('bills.yearSuffix')}${monthNum}${t('bills.monthSuffix')}`;

  return {
    mode: 'month',
    year: yearStr,
    month: `${yearStr}-${monthStr}`,
    label,
  };
}

/**
 * 解析账单筛选时间参数
 * @returns {{ preset: string, month?: string, year?: string, months?: string[] }}
 */
export function resolveBillTimeParams(timeValue, customTime) {
  const now = dayjs();

  if (customTime?.mode === 'year') {
    return {
      preset: 'custom_year',
      year: customTime.year,
      month: '',
    };
  }

  if (customTime?.mode === 'month') {
    return {
      preset: 'custom_month',
      month: customTime.month,
      year: '',
    };
  }

  switch (timeValue) {
    case 'all':
      return { preset: 'all', month: '', year: '' };
    case 'last_month':
      return {
        preset: 'last_month',
        month: now.subtract(1, 'month').format('YYYY-MM'),
        year: '',
      };
    case 'last_3_months':
      return {
        preset: 'last_3_months',
        month: '',
        year: '',
        months: [0, 1, 2].map((offset) => now.subtract(offset, 'month').format('YYYY-MM')),
      };
    case 'this_month':
    default:
      return {
        preset: 'this_month',
        month: now.format('YYYY-MM'),
        year: '',
      };
  }
}

/** 按时间参数过滤账单记录 */
export function filterRecordsByTime(records, timeParams = {}) {
  const { preset, month, year, months } = timeParams;
  if (preset === 'all' || (!month && !year && !months?.length)) {
    return records;
  }

  return records.filter((item) => {
    const occurredAt = item.occurredAt || item.occurred_at;
    if (!occurredAt) return false;
    const date = dayjs(occurredAt);

    if (year) {
      return date.format('YYYY') === year;
    }
    if (month) {
      return date.format('YYYY-MM') === month;
    }
    if (months?.length) {
      return months.includes(date.format('YYYY-MM'));
    }
    return true;
  });
}
