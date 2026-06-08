<template>
  <view class="stats-trend-panel">
    <view class="stats-trend-panel__toolbar">
      <view class="stats-trend-panel__date" @click="datePickerShow = true">
        <u-icon name="calendar" color="#0984E3" size="16" />
        <text class="stats-trend-panel__date-text">{{ dateLabel }}</text>
      </view>
      <view class="stats-trend-panel__granularity">
        <view
          v-for="item in granularities"
          :key="item.value"
          class="stats-trend-panel__chip"
          :class="{ 'stats-trend-panel__chip--active': item.value === granularity }"
          @click="onGranularityChange(item.value)"
        >
          <text class="stats-trend-panel__chip-text">{{ item.label }}</text>
        </view>
      </view>
    </view>
    <stats-trend-chart :points="points" :title="$t('stats.consumeTrend')" />
    <stats-trend-date-picker
      :show="datePickerShow"
      :granularity="granularity"
      :anchor-date="anchorDate"
      @confirm="onDateConfirm"
      @close="datePickerShow = false"
    />
  </view>
</template>

<script>
  import StatsTrendChart from '@/components/stats/StatsTrendChart/StatsTrendChart.vue';
  import StatsTrendDatePicker from '@/components/stats/StatsTrendDatePicker/StatsTrendDatePicker.vue';
  import { STATS_TREND_GRANULARITY } from '@/constants/stats.js';

  export default {
    name: 'StatsTrendPanel',
    components: {
      StatsTrendChart,
      StatsTrendDatePicker,
    },
    props: {
      points: {
        type: Array,
        default: () => [],
      },
      granularity: {
        type: String,
        default: 'week',
      },
      anchorDate: {
        type: String,
        default: '',
      },
      dateLabel: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        granularities: STATS_TREND_GRANULARITY,
        datePickerShow: false,
      };
    },
    methods: {
      onGranularityChange(value) {
        if (value !== this.granularity) {
          this.$emit('granularity-change', value);
        }
      },
      onDateConfirm(anchorDate) {
        this.datePickerShow = false;
        this.$emit('date-change', anchorDate);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .stats-trend-panel__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-md;
    gap: $spacing-sm;
  }

  .stats-trend-panel__date {
    display: flex;
    flex: 1;
    align-items: center;
    min-width: 0;
    height: 56rpx;
    padding: 0 $spacing-md;
    border-radius: 999rpx;
    background-color: $color-bg-card;
    box-shadow: 0 2rpx 12rpx rgba(45, 52, 54, 0.04);
    gap: 8rpx;
  }

  .stats-trend-panel__date-text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    color: $color-text-primary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .stats-trend-panel__granularity {
    display: flex;
    flex-shrink: 0;
    gap: $spacing-xs;
  }

  .stats-trend-panel__chip {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 64rpx;
    height: 56rpx;
    padding: 0 $spacing-md;
    border-radius: 999rpx;
    background-color: $color-bg-card;
    box-shadow: 0 2rpx 12rpx rgba(45, 52, 54, 0.04);
  }

  .stats-trend-panel__chip--active {
    background: rgba(9, 132, 227, 0.12);
  }

  .stats-trend-panel__chip-text {
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }

  .stats-trend-panel__chip--active .stats-trend-panel__chip-text {
    color: $color-secondary;
    font-weight: $font-weight-medium;
  }
</style>
