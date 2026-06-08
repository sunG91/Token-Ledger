<template>
  <view class="ranking-card">
    <text class="ranking-card__title">{{ card.title }}</text>
    <text class="ranking-card__period">{{ card.period }}</text>
    <view class="ranking-card__list">
      <view v-for="(item, index) in card.items" :key="item.platformId" class="ranking-card__row">
        <text class="ranking-card__rank" :class="{ 'ranking-card__rank--top': index < 3 }">
          {{ index + 1 }}
        </text>
        <platform-icon :platform-id="item.platformId" :size="40" />
        <text class="ranking-card__name">{{ item.name }}</text>
        <text class="ranking-card__tokens">{{ formatToken(item.tokenCount) }}</text>
      </view>
    </view>
    <text class="ranking-card__time">{{ displayTime }}</text>
  </view>
</template>

<script>
  import { formatToken } from '@/utils/format.js';

  export default {
    name: 'RankingCard',
    props: {
      card: {
        type: Object,
        required: true,
      },
      displayTime: {
        type: String,
        default: '',
      },
    },
    methods: {
      formatToken,
    },
  };
</script>

<style lang="scss" scoped>
  .ranking-card {
    display: flex;
    flex-direction: column;
    align-self: flex-start;
    width: 85%;
    padding: $spacing-md $spacing-md;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
  }

  .ranking-card__title {
    color: $color-text-primary;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
  }

  .ranking-card__period {
    margin-top: 4rpx;
    color: $color-text-placeholder;
    font-size: $font-size-xs;
  }

  .ranking-card__list {
    margin-top: $spacing-md;
  }

  .ranking-card__row {
    display: flex;
    align-items: center;
    padding: $spacing-sm 0;
    border-bottom: 1rpx solid $color-bg-muted;
    gap: $spacing-sm;

    &:last-child {
      border-bottom: none;
    }
  }

  .ranking-card__rank {
    flex-shrink: 0;
    width: 36rpx;
    color: $color-text-placeholder;
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    text-align: center;
  }

  .ranking-card__rank--top {
    color: $color-secondary;
  }

  .ranking-card__name {
    flex: 1;
    min-width: 0;
    color: $color-text-primary;
    font-size: $font-size-sm;
  }

  .ranking-card__tokens {
    flex-shrink: 0;
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }

  .ranking-card__time {
    align-self: flex-end;
    margin-top: $spacing-sm;
    color: $color-text-placeholder;
    font-size: $font-size-xs;
  }
</style>
