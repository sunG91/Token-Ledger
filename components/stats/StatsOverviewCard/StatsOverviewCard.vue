<template>
  <view class="stats-overview-card">
    <text class="stats-overview-card__title">{{ $t('stats.monthOverview') }}</text>
    <view class="stats-overview-card__metrics">
      <view class="stats-overview-card__metric">
        <text class="stats-overview-card__value">{{ totalTokens }}</text>
        <text class="stats-overview-card__label">{{ $t('stats.totalTokens') }}</text>
      </view>
    </view>
  </view>
</template>

<script>
  import { formatToken } from '@/utils/format.js';

  export default {
    name: 'StatsOverviewCard',
    props: {
      overview: {
        type: Object,
        default: () => ({}),
      },
    },
    computed: {
      totalTokens() {
        return formatToken(this.overview.totalTokens);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .stats-overview-card {
    padding: $spacing-lg;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
  }

  .stats-overview-card__title {
    color: $color-text-primary;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
  }

  .stats-overview-card__metrics {
    display: flex;
    margin-top: $spacing-lg;
    gap: $spacing-sm;
  }

  .stats-overview-card__metric {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    min-width: 0;
  }

  .stats-overview-card__value {
    color: $color-text-primary;
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    line-height: 1.2;
  }

  .stats-overview-card__label {
    margin-top: $spacing-xs;
    color: $color-text-secondary;
    font-size: $font-size-xs;
    text-align: center;
  }
</style>
