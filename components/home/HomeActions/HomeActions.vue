<template>
  <view class="home-actions">
    <view class="home-actions__row">
      <view class="home-actions__btn home-actions__btn--primary" @click="onRecord">
        <u-icon name="edit-pen" color="#FFFFFF" size="18" />
        <text class="home-actions__btn-text home-actions__btn-text--light">{{ $t('home.goRecord') }}</text>
      </view>
      <view class="home-actions__btn home-actions__btn--secondary" @click="onApiKey">
        <u-icon name="lock" color="#6C5CE7" size="18" />
        <text class="home-actions__btn-text home-actions__btn-text--purple">{{ $t('home.buyApiKey') }}</text>
      </view>
    </view>
    <view class="home-actions__all" @click="onAllBills">
      <text class="home-actions__all-text">{{ $t('home.allBills') }}</text>
    </view>
  </view>
</template>

<script>
  import { switchTab } from '@/utils/tab.js';

  export default {
    name: 'HomeActions',
    methods: {
      onRecord() {
        switchTab('/pages/records/index');
      },
      onApiKey() {
        uni.navigateTo({ url: '/pages/api-keys/index' });
      },
      onAllBills() {
        switchTab('/pages/bills/index');
      },
    },
  };
</script>

<style lang="scss" scoped>
  .home-actions {
    padding: $spacing-md $spacing-lg $spacing-sm;
  }

  .home-actions__row {
    display: flex;
    gap: $spacing-md;
  }

  .home-actions__btn {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    height: 96rpx;
    border-radius: 48rpx;
    gap: $spacing-xs;
  }

  .home-actions__btn--primary {
    background-color: $color-secondary;
    box-shadow: $shadow-button;
  }

  .home-actions__btn--secondary {
    background-color: rgba(108, 92, 231, 0.12);
  }

  .home-actions__btn-text {
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
  }

  .home-actions__btn-text--light {
    color: $color-text-inverse;
  }

  .home-actions__btn-text--purple {
    color: $color-primary;
  }

  .home-actions__all {
    display: flex;
    justify-content: center;
    margin-top: $spacing-lg;
  }

  .home-actions__all-text {
    padding: $spacing-sm $spacing-xl;
    border-radius: 40rpx;
    background-color: rgba(9, 132, 227, 0.08);
    color: $color-secondary;
    font-size: $font-size-sm;
  }
</style>
