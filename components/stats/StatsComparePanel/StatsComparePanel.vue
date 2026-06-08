<template>
  <view class="stats-compare-panel">
    <view class="stats-compare-panel__card">
      <text class="stats-compare-panel__title">{{ $t('stats.monthVsLast') }}</text>
      <view
        v-for="metric in metrics"
        :key="metric.key"
        class="stats-compare-panel__metric"
      >
        <text class="stats-compare-panel__metric-label">{{ metric.label }}</text>
        <view class="stats-compare-panel__bars">
          <view class="stats-compare-panel__bar-row">
            <text class="stats-compare-panel__bar-label">{{ $t('stats.currentMonth') }}</text>
            <view class="stats-compare-panel__bar-track">
              <view
                class="stats-compare-panel__bar-fill stats-compare-panel__bar-fill--current"
                :style="{ width: barWidth(metric.key, 'current') }"
              />
            </view>
            <text class="stats-compare-panel__bar-value">{{ formatMetric(metric.key, 'current') }}</text>
          </view>
          <view class="stats-compare-panel__bar-row">
            <text class="stats-compare-panel__bar-label">{{ $t('stats.lastMonth') }}</text>
            <view class="stats-compare-panel__bar-track">
              <view
                class="stats-compare-panel__bar-fill stats-compare-panel__bar-fill--previous"
                :style="{ width: barWidth(metric.key, 'previous') }"
              />
            </view>
            <text class="stats-compare-panel__bar-value">{{ formatMetric(metric.key, 'previous') }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import { formatToken } from '@/utils/format.js';

  export default {
    name: 'StatsComparePanel',
    props: {
      compare: {
        type: Object,
        default: () => ({
          current: {},
          previous: {},
        }),
      },
    },
    computed: {
      metrics() {
        void this.$store.state.preferenceRevision;
        return [{ key: 'tokens', label: this.$t('stats.metricTokens') }];
      },
    },
    methods: {
      getMetricValue(key, period) {
        const data = this.compare[period] || {};
        return Number(data.tokens) || 0;
      },
      barWidth(key, period) {
        const current = this.getMetricValue(key, 'current');
        const previous = this.getMetricValue(key, 'previous');
        const max = Math.max(current, previous, 1);
        const value = this.getMetricValue(key, period);
        return `${Math.round((value / max) * 100)}%`;
      },
      formatMetric(key, period) {
        return formatToken(this.getMetricValue(key, period));
      },
    },
  };
</script>

<style lang="scss" scoped>
  .stats-compare-panel__card {
    padding: $spacing-lg;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
  }

  .stats-compare-panel__title {
    color: $color-text-primary;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
  }

  .stats-compare-panel__metric {
    margin-top: $spacing-lg;

    &:first-of-type {
      margin-top: $spacing-md;
    }
  }

  .stats-compare-panel__metric-label {
    display: block;
    margin-bottom: $spacing-sm;
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }

  .stats-compare-panel__bars {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  .stats-compare-panel__bar-row {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .stats-compare-panel__bar-label {
    flex-shrink: 0;
    width: 64rpx;
    color: $color-text-placeholder;
    font-size: $font-size-xs;
  }

  .stats-compare-panel__bar-track {
    flex: 1;
    overflow: hidden;
    height: 16rpx;
    border-radius: 999rpx;
    background-color: $color-bg-muted;
  }

  .stats-compare-panel__bar-fill {
    height: 100%;
    border-radius: 999rpx;
    transition: width 0.4s ease;
  }

  .stats-compare-panel__bar-fill--current {
    background: $color-primary-gradient;
  }

  .stats-compare-panel__bar-fill--previous {
    background-color: rgba(178, 190, 195, 0.65);
  }

  .stats-compare-panel__bar-value {
    flex-shrink: 0;
    min-width: 120rpx;
    color: $color-text-primary;
    font-size: $font-size-xs;
    text-align: right;
  }
</style>
