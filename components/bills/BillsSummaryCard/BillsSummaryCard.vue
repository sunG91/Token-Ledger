<template>
  <view class="bills-summary" :class="summaryClass" :style="summaryStyle">
    <view v-if="!isCompact" class="bills-summary__top">
      <text class="bills-summary__label">{{ $t('bills.monthlySpend') }}</text>
      <view class="bills-summary__icon">
        <u-icon name="clock" color="#B2BEC3" size="18" />
      </view>
    </view>
    <view v-else class="bills-summary__compact">
      <text class="bills-summary__label">{{ $t('bills.monthlySpend') }}</text>
      <text class="bills-summary__tokens bills-summary__tokens--inline">{{ totalTokens }} token</text>
    </view>
    <text v-if="!isCompact" class="bills-summary__tokens" :style="tokensStyle">
      {{ totalTokens }} token
    </text>
  </view>
</template>

<script>
  import { formatToken } from '@/utils/format.js';

  export default {
    name: 'BillsSummaryCard',
    props: {
      summary: {
        type: Object,
        default: () => ({}),
      },
      collapseProgress: {
        type: Number,
        default: 0,
      },
    },
    computed: {
      totalTokens() {
        return formatToken(this.summary.totalTokens);
      },
      isCompact() {
        return this.collapseProgress >= 0.85;
      },
      summaryClass() {
        return {
          'bills-summary--collapsing': this.collapseProgress > 0 && !this.isCompact,
          'bills-summary--compact': this.isCompact,
        };
      },
      summaryStyle() {
        const p = Math.min(Math.max(this.collapseProgress, 0), 1);
        return {
          padding: `${32 - 20 * p}rpx ${32}rpx ${24 - 16 * p}rpx`,
          marginBottom: `${24 - 12 * p}rpx`,
        };
      },
      tokensStyle() {
        const p = Math.min(Math.max(this.collapseProgress, 0), 1);
        return {
          fontSize: `${56 - 18 * p}rpx`,
          marginTop: `${24 - 16 * p}rpx`,
          opacity: 1 - p * 0.15,
        };
      },
    },
  };
</script>

<style lang="scss" scoped>
  .bills-summary {
    position: relative;
    margin: 0 $spacing-lg;
    border-radius: $radius-card;
    background: $gradient-highlight-card;
    box-shadow: $shadow-card;
    overflow: hidden;
    transition:
      padding 0.15s ease,
      margin-bottom 0.15s ease;
  }

  .bills-summary--compact {
    padding: $spacing-sm $spacing-lg !important;
    margin-bottom: $spacing-sm !important;
  }

  .bills-summary__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .bills-summary__compact {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .bills-summary__label {
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }

  .bills-summary__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48rpx;
    height: 48rpx;
    border-radius: $radius-circle;
    background-color: $color-icon-well;
    transition: opacity 0.15s ease;
  }

  .bills-summary--collapsing .bills-summary__icon {
    opacity: 0.5;
  }

  .bills-summary__tokens {
    display: block;
    color: $color-text-primary;
    font-weight: $font-weight-bold;
    line-height: 1.15;
    transition:
      font-size 0.15s ease,
      margin-top 0.15s ease,
      opacity 0.15s ease;
  }

  .bills-summary__tokens--inline {
    font-size: $font-size-lg;
  }
</style>
