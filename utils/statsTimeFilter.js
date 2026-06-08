/**
 * 统计趋势时间解析
 */
import dayjs from 'dayjs';
import { getBillYearRange } from '@/utils/billTimeFilter.js';

/** 以周一为一周起始 */
export function getWeekRange(date) {
  const d = dayjs(date);
  const weekday = d.day();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  const start = d.add(mondayOffset, 'day').startOf('day');
  const end = start.add(6, 'day').endOf('day');
  return { start, end };
}

/** 趋势页左上角日期展示 */
export function formatStatsTrendDateLabel(granularity, anchorDate) {
  const anchor = dayjs(anchorDate || undefined);
  if (!anchor.isValid()) return '';

  if (granularity === 'month') {
    return anchor.format('YYYY年M月');
  }

  const { start, end } = getWeekRange(anchor);
  const sameYear = start.year() === end.year();
  if (sameYear) {
    return `${start.format('YYYY年M月D日')} ~ ${end.format('M月D日')}`;
  }
  return `${start.format('YYYY年M月D日')} ~ ${end.format('YYYY年M月D日')}`;
}

/** 解析趋势请求参数 */
export function resolveStatsTrendParams(granularity, anchorDate) {
  const anchor = dayjs(anchorDate || undefined);
  const safeAnchor = anchor.isValid() ? anchor : dayjs();

  if (granularity === 'month') {
    const monthStart = safeAnchor.startOf('month');
    return {
      granularity,
      date: monthStart.format('YYYY-MM'),
      anchor: safeAnchor.format('YYYY-MM-DD'),
    };
  }

  const { start, end } = getWeekRange(safeAnchor);
  return {
    granularity: 'week',
    date: start.format('YYYY-MM-DD'),
    endDate: end.format('YYYY-MM-DD'),
    anchor: safeAnchor.format('YYYY-MM-DD'),
  };
}

export function getStatsYearRange() {
  return getBillYearRange();
}

export function getStatsMonthList() {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
}

export function getStatsDayList(year, month) {
  const daysInMonth = dayjs(`${year}-${month}-01`).daysInMonth();
  const days = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(day);
  }
  return days;
}
