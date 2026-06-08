<template>
  <view class="summary-cards">
    <view class="summary-cards__item summary-cards__item--primary">
      <text class="summary-cards__label">{{ $t('home.monthlyConsumed') }}</text>
      <text class="summary-cards__value">{{ consumedTokens }}</text>
      <text v-if="consumedSubText" class="summary-cards__sub summary-cards__sub--hint">
        {{ consumedSubText }}
      </text>
    </view>
    <view class="summary-cards__item summary-cards__item--secondary">
      <text class="summary-cards__label">{{ $t('home.monthlyQuota') }}</text>
      <text class="summary-cards__value">{{ quotaTokens }}</text>
      <text v-if="quotaSubText" class="summary-cards__sub summary-cards__sub--hint">
        {{ quotaSubText }}
      </text>
    </view>
  </view>
</template>

<script>
  import { formatToken } from '@/utils/format.js';

  export default {
    name: 'SummaryCards',
    props: {
      summary: {
        type: Object,
        default: () => ({}),
      },
    },
    computed: {
      consumedTokens() {
        return formatToken(this.summary.consumedTokens);
      },
      consumedSubText() {
        void this.$store.state.preferenceRevision;
        if (this.summary.consumedHint) {
          return this.summary.consumedHint;
        }
        if (this.summary.otherTokenPercent > 0) {
          return this.$t('monthlyOverview.hintOtherShare', {
            percent: this.summary.otherTokenPercent,
          });
        }
        return '';
      },
      quotaTokens() {
        return formatToken(this.summary.quotaTokens);
      },
      quotaSubText() {
        void this.$store.state.preferenceRevision;
        return this.summary.quotaHint || '';
      },
    },
  };
</script>

<style lang="scss" scoped>
  .summary-cards {
    display: flex;
    gap: $spacing-md;
    padding: 0 $spacing-lg;
    margin-top: $spacing-sm;
  }

  .summary-cards__item {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    padding: $spacing-lg $spacing-md;
    border-radius: $radius-card;
  }

  .summary-cards__item--primary {
    background: $gradient-highlight-card;
    box-shadow: $shadow-card;
  }

  .summary-cards__item--secondary {
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
  }

  .summary-cards__label {
    color: $color-text-secondary;
    font-size: $font-size-xs;
  }

  .summary-cards__value {
    margin-top: $spacing-sm;
    color: $color-text-primary;
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    line-height: 1.2;
  }

  .summary-cards__sub {
    margin-top: $spacing-xs;
    color: $color-text-secondary;
    font-size: $font-size-xs;
  }

  .summary-cards__sub--hint {
    line-height: 1.4;
  }
</style>
