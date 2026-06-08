<template>
  <view class="api-key-tips-card">
    <text class="api-key-tips-card__title">{{ $t('apiKeys.tipsTitle') }}</text>
    <view class="api-key-tips-card__list">
      <view v-for="(tip, index) in tips" :key="index" class="api-key-tips-card__item">
        <view class="api-key-tips-card__dot" />
        <text class="api-key-tips-card__text">{{ tip }}</text>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    name: 'ApiKeyTipsCard',
    props: {
      tips: {
        type: Array,
        default: () => [],
      },
    },
  };
</script>

<style lang="scss" scoped>
  .api-key-tips-card {
    padding: $spacing-lg;
    border-radius: $radius-card;
    background: linear-gradient(135deg, rgba(116, 185, 255, 0.12) 0%, rgba(9, 132, 227, 0.08) 100%);
  }

  .api-key-tips-card__title {
    color: $color-text-primary;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
  }

  .api-key-tips-card__list {
    display: flex;
    flex-direction: column;
    margin-top: $spacing-md;
    gap: $spacing-sm;
  }

  .api-key-tips-card__item {
    display: flex;
    align-items: flex-start;
    gap: $spacing-sm;
  }

  .api-key-tips-card__dot {
    flex-shrink: 0;
    width: 10rpx;
    height: 10rpx;
    margin-top: 12rpx;
    border-radius: $radius-circle;
    background-color: $color-secondary;
  }

  .api-key-tips-card__text {
    flex: 1;
    color: $color-text-secondary;
    font-size: $font-size-sm;
    line-height: 1.6;
  }
</style>
