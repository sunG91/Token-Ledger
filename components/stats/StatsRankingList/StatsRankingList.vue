<template>
  <view class="stats-ranking-list">
    <text class="stats-ranking-list__title">{{ $t('stats.modelRanking') }}</text>
    <view class="stats-ranking-list__body">
      <view v-for="item in items" :key="item.platformId" class="stats-ranking-list__item">
        <view class="stats-ranking-list__top">
          <view class="stats-ranking-list__left">
            <platform-icon :platform-id="item.platformId" :size="48" />
            <text class="stats-ranking-list__name">{{ item.platformLabel }}</text>
          </view>
          <view class="stats-ranking-list__right">
            <text class="stats-ranking-list__value">{{ formatToken(item.tokenCount) }}</text>
            <text class="stats-ranking-list__percent">({{ formatPercent(item.percent) }}%)</text>
          </view>
        </view>
        <view class="stats-ranking-list__bar">
          <view
            class="stats-ranking-list__bar-fill"
            :style="{
              width: barWidth(item.percent),
              backgroundColor: getBarColor(item.platformId),
            }"
          />
        </view>
      </view>
      <view v-if="!items.length" class="stats-ranking-list__empty">
        <text class="stats-ranking-list__empty-text">{{ $t('stats.emptyRanking') }}</text>
      </view>
    </view>
  </view>
</template>

<script>
  import PlatformIcon from '@/components/base/PlatformIcon/PlatformIcon.vue';
  import { getStatsRankingColor } from '@/constants/stats.js';
  import { formatToken } from '@/utils/format.js';

  export default {
    name: 'StatsRankingList',
    components: {
      PlatformIcon,
    },
    props: {
      items: {
        type: Array,
        default: () => [],
      },
    },
    methods: {
      formatToken,
      formatPercent(value) {
        return (Number(value) || 0).toFixed(1);
      },
      getBarColor(platformId) {
        return getStatsRankingColor(platformId);
      },
      barWidth(percent) {
        const value = Math.min(Math.max(Number(percent) || 0, 0), 100);
        return `${value}%`;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .stats-ranking-list {
    padding: $spacing-lg;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
  }

  .stats-ranking-list__title {
    color: $color-text-primary;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
  }

  .stats-ranking-list__body {
    margin-top: $spacing-md;
  }

  .stats-ranking-list__item {
    margin-top: $spacing-md;

    &:first-child {
      margin-top: 0;
    }
  }

  .stats-ranking-list__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-sm;
  }

  .stats-ranking-list__left {
    display: flex;
    flex: 1;
    align-items: center;
    min-width: 0;
    gap: $spacing-sm;
  }

  .stats-ranking-list__name {
    overflow: hidden;
    color: $color-text-primary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .stats-ranking-list__right {
    display: flex;
    flex-shrink: 0;
    align-items: baseline;
    gap: 4rpx;
  }

  .stats-ranking-list__value {
    color: $color-text-primary;
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
  }

  .stats-ranking-list__percent {
    color: $color-text-secondary;
    font-size: $font-size-xs;
  }

  .stats-ranking-list__bar {
    overflow: hidden;
    height: 12rpx;
    margin-top: $spacing-xs;
    border-radius: 999rpx;
    background-color: $color-bg-muted;
  }

  .stats-ranking-list__bar-fill {
    height: 100%;
    border-radius: 999rpx;
    transition: width 0.4s ease;
  }

  .stats-ranking-list__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-xl 0;
  }

  .stats-ranking-list__empty-text {
    color: $color-text-placeholder;
    font-size: $font-size-sm;
  }
</style>
