<template>
  <u-popup :show="show" mode="bottom" round="16" @close="onClose">
    <view class="stats-date-picker" :style="{ paddingBottom: safeBottom + 'px' }">
      <view class="stats-date-picker__header">
        <text class="stats-date-picker__title">{{ pickerTitle }}</text>
        <text class="stats-date-picker__close" @click="onClose">取消</text>
      </view>
      <picker-view
        class="stats-date-picker__wheel"
        indicator-style="height: 88rpx"
        :value="pickerValue"
        @change="onPickerChange"
      >
        <picker-view-column>
          <view v-for="year in years" :key="year" class="stats-date-picker__wheel-item">
            {{ year }}年
          </view>
        </picker-view-column>
        <picker-view-column>
          <view v-for="month in months" :key="month" class="stats-date-picker__wheel-item">
            {{ month }}月
          </view>
        </picker-view-column>
        <picker-view-column v-if="showDayColumn">
          <view v-for="day in days" :key="day" class="stats-date-picker__wheel-item">
            {{ day }}日
          </view>
        </picker-view-column>
      </picker-view>
      <view class="stats-date-picker__confirm" @click="onConfirm">
        <text class="stats-date-picker__confirm-text">确定</text>
      </view>
    </view>
  </u-popup>
</template>

<script>
  import dayjs from 'dayjs';
  import { getStatsDayList, getStatsMonthList, getStatsYearRange } from '@/utils/statsTimeFilter.js';
  import { getSafeAreaBottom } from '@/utils/system.js';

  export default {
    name: 'StatsTrendDatePicker',
    props: {
      show: {
        type: Boolean,
        default: false,
      },
      granularity: {
        type: String,
        default: 'week',
      },
      anchorDate: {
        type: String,
        default: '',
      },
    },
    data() {
      const now = dayjs();
      return {
        safeBottom: getSafeAreaBottom(),
        years: getStatsYearRange(),
        months: getStatsMonthList(),
        days: getStatsDayList(now.year(), now.month() + 1),
        selectedYear: now.year(),
        selectedMonth: now.month() + 1,
        selectedDay: now.date(),
      };
    },
    computed: {
      showDayColumn() {
        return this.granularity === 'week';
      },
      pickerTitle() {
        if (this.granularity === 'month') return '选择月份';
        return '选择周内日期';
      },
      pickerValue() {
        const yearIndex = Math.max(this.years.findIndex((year) => year === this.selectedYear), 0);
        const monthIndex = Math.max(this.selectedMonth - 1, 0);
        const dayIndex = Math.max(this.selectedDay - 1, 0);
        return this.showDayColumn ? [yearIndex, monthIndex, dayIndex] : [yearIndex, monthIndex];
      },
    },
    watch: {
      show(visible) {
        if (visible) {
          this.syncFromAnchor();
        }
      },
      granularity() {
        if (this.show) {
          this.syncFromAnchor();
        }
      },
    },
    methods: {
      syncFromAnchor() {
        const anchor = dayjs(this.anchorDate || undefined);
        const date = anchor.isValid() ? anchor : dayjs();
        this.selectedYear = date.year();
        this.selectedMonth = date.month() + 1;
        this.selectedDay = date.date();
        this.days = getStatsDayList(this.selectedYear, this.selectedMonth);
        if (this.selectedDay > this.days.length) {
          this.selectedDay = this.days.length;
        }
      },
      onPickerChange(e) {
        const values = e.detail.value || [];
        const [yearIndex, monthIndex, dayIndex = this.selectedDay - 1] = values;
        const nextYear = this.years[yearIndex] || this.selectedYear;
        const nextMonth = this.months[monthIndex] || this.selectedMonth;
        const nextDays = getStatsDayList(nextYear, nextMonth);

        this.selectedYear = nextYear;
        this.selectedMonth = nextMonth;
        this.days = nextDays;
        this.selectedDay = nextDays[dayIndex] || nextDays[nextDays.length - 1] || 1;
      },
      onConfirm() {
        const monthStr = String(this.selectedMonth).padStart(2, '0');
        const dayStr = String(this.selectedDay).padStart(2, '0');
        const anchor =
          this.granularity === 'month'
            ? `${this.selectedYear}-${monthStr}-01`
            : `${this.selectedYear}-${monthStr}-${dayStr}`;
        this.$emit('confirm', anchor);
        this.onClose();
      },
      onClose() {
        this.$emit('close');
      },
    },
  };
</script>

<style lang="scss" scoped>
  .stats-date-picker {
    padding: $spacing-lg $spacing-lg $spacing-md;
    background-color: $color-bg-card;
  }

  .stats-date-picker__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-md;
  }

  .stats-date-picker__title {
    color: $color-text-primary;
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
  }

  .stats-date-picker__close {
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }

  .stats-date-picker__wheel {
    width: 100%;
    height: 360rpx;
  }

  .stats-date-picker__wheel-item {
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-text-primary;
    font-size: $font-size-base;
  }

  .stats-date-picker__confirm {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88rpx;
    margin-top: $spacing-md;
    border-radius: 44rpx;
    background-color: $color-secondary;
  }

  .stats-date-picker__confirm-text {
    color: $color-text-inverse;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
  }
</style>
