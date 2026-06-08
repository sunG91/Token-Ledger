<template>
  <u-popup :show="show" mode="bottom" round="16" @close="onClose">
    <view class="bills-date-picker" :style="{ paddingBottom: safeBottom + 'px' }">
      <view class="bills-date-picker__header">
        <text class="bills-date-picker__title">选择日期</text>
        <text class="bills-date-picker__close" @click="onClose">取消</text>
      </view>
      <view class="bills-date-picker__tabs">
        <view
          class="bills-date-picker__tab"
          :class="{ 'bills-date-picker__tab--active': granularity === 'year' }"
          @click="onGranularityChange('year')"
        >
          <text class="bills-date-picker__tab-text">按年</text>
        </view>
        <view
          class="bills-date-picker__tab"
          :class="{ 'bills-date-picker__tab--active': granularity === 'month' }"
          @click="onGranularityChange('month')"
        >
          <text class="bills-date-picker__tab-text">按月</text>
        </view>
      </view>
      <picker-view
        class="bills-date-picker__wheel"
        indicator-style="height: 88rpx"
        :value="pickerValue"
        @change="onPickerChange"
      >
        <picker-view-column>
          <view
            v-for="year in years"
            :key="year"
            class="bills-date-picker__wheel-item"
          >
            {{ year }}年
          </view>
        </picker-view-column>
        <picker-view-column v-if="granularity === 'month'">
          <view
            v-for="month in months"
            :key="month"
            class="bills-date-picker__wheel-item"
          >
            {{ month }}月
          </view>
        </picker-view-column>
      </picker-view>
      <view class="bills-date-picker__confirm" @click="onConfirm">
        <text class="bills-date-picker__confirm-text">确定</text>
      </view>
    </view>
  </u-popup>
</template>

<script>
  import dayjs from 'dayjs';
  import { createCustomBillTime, getBillYearRange } from '@/utils/billTimeFilter.js';
  import { getSafeAreaBottom } from '@/utils/system.js';

  export default {
    name: 'BillsDatePicker',
    props: {
      show: {
        type: Boolean,
        default: false,
      },
      initialCustomTime: {
        type: Object,
        default: null,
      },
    },
    data() {
      const currentYear = dayjs().year();
      const currentMonth = dayjs().month() + 1;
      return {
        safeBottom: getSafeAreaBottom(),
        granularity: 'month',
        years: getBillYearRange(),
        months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        selectedYear: currentYear,
        selectedMonth: currentMonth,
      };
    },
    computed: {
      pickerValue() {
        const yearIndex = Math.max(
          this.years.findIndex((year) => year === this.selectedYear),
          0
        );
        const monthIndex = Math.max(this.selectedMonth - 1, 0);
        return this.granularity === 'year' ? [yearIndex] : [yearIndex, monthIndex];
      },
    },
    watch: {
      show(visible) {
        if (visible) {
          this.syncFromInitial();
        }
      },
    },
    methods: {
      syncFromInitial() {
        const now = dayjs();
        if (this.initialCustomTime?.mode === 'year') {
          this.granularity = 'year';
          this.selectedYear = Number(this.initialCustomTime.year) || now.year();
          this.selectedMonth = now.month() + 1;
          return;
        }
        if (this.initialCustomTime?.mode === 'month') {
          this.granularity = 'month';
          const [year, month] = (this.initialCustomTime.month || '').split('-');
          this.selectedYear = Number(year) || now.year();
          this.selectedMonth = Number(month) || now.month() + 1;
          return;
        }
        this.granularity = 'month';
        this.selectedYear = now.year();
        this.selectedMonth = now.month() + 1;
      },
      onGranularityChange(mode) {
        this.granularity = mode;
      },
      onPickerChange(e) {
        const [yearIndex, monthIndex = this.selectedMonth - 1] = e.detail.value;
        this.selectedYear = this.years[yearIndex] || this.selectedYear;
        this.selectedMonth = (this.months[monthIndex] || this.selectedMonth);
      },
      onConfirm() {
        const customTime = createCustomBillTime({
          mode: this.granularity,
          year: this.selectedYear,
          month: this.selectedMonth,
        });
        this.$emit('confirm', customTime);
        this.onClose();
      },
      onClose() {
        this.$emit('close');
      },
    },
  };
</script>

<style lang="scss" scoped>
  .bills-date-picker {
    padding: $spacing-lg $spacing-lg $spacing-md;
    background-color: $color-bg-card;
  }

  .bills-date-picker__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-md;
  }

  .bills-date-picker__title {
    color: $color-text-primary;
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
  }

  .bills-date-picker__close {
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }

  .bills-date-picker__tabs {
    display: flex;
    padding: 6rpx;
    border-radius: 999rpx;
    background-color: $color-bg-muted;
    gap: 6rpx;
  }

  .bills-date-picker__tab {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    height: 64rpx;
    border-radius: 999rpx;
  }

  .bills-date-picker__tab--active {
    background-color: $color-bg-card;
    box-shadow: 0 2rpx 8rpx rgba(45, 52, 54, 0.06);
  }

  .bills-date-picker__tab-text {
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }

  .bills-date-picker__tab--active .bills-date-picker__tab-text {
    color: $color-primary;
    font-weight: $font-weight-medium;
  }

  .bills-date-picker__wheel {
    width: 100%;
    height: 360rpx;
    margin-top: $spacing-md;
  }

  .bills-date-picker__wheel-item {
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-text-primary;
    font-size: $font-size-base;
  }

  .bills-date-picker__confirm {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88rpx;
    margin-top: $spacing-md;
    border-radius: 44rpx;
    background-color: $color-secondary;
  }

  .bills-date-picker__confirm-text {
    color: $color-text-inverse;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
  }
</style>
