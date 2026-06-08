<template>
  <view class="pro-member-banner" @click="onRenew">
    <image class="pro-member-banner__bg" :src="memberVipIcon" mode="aspectFit" />
    <view class="pro-member-banner__content">
      <image class="pro-member-banner__icon" :src="memberCrownIcon" mode="aspectFit" />
      <view class="pro-member-banner__text">
        <text class="pro-member-banner__title">{{ $t('profile.proTitle') }}</text>
        <text class="pro-member-banner__desc">{{ $t('profile.proDesc') }}</text>
      </view>
    </view>
    <view class="pro-member-banner__btn">
      <text class="pro-member-banner__btn-text">{{ $t('profile.renewNow') }}</text>
    </view>
  </view>
</template>

<script>
  import { getProfileIcon } from '@/constants/profileIcons.js';

  export default {
    name: 'ProMemberBanner',
    computed: {
      memberCrownIcon() {
        return getProfileIcon('memberCrown');
      },
      memberVipIcon() {
        return getProfileIcon('memberVip');
      },
    },
    methods: {
      onRenew() {
        this.$emit('renew');
      },
    },
  };
</script>

<style lang="scss" scoped>
  .pro-member-banner {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: $spacing-md;
    padding: $spacing-lg;
    overflow: hidden;
    border-radius: $radius-card;
    background: linear-gradient(135deg, #2d3436 0%, #1a1a2e 100%);
    box-shadow: $shadow-card;
    gap: $spacing-md;
  }

  .pro-member-banner__bg {
    position: absolute;
    top: 50%;
    right: -24rpx;
    width: 220rpx;
    height: 160rpx;
    opacity: 0.35;
    transform: translateY(-50%);
    pointer-events: none;
  }

  .pro-member-banner__content {
    position: relative;
    z-index: 1;
    display: flex;
    flex: 1;
    align-items: center;
    min-width: 0;
    gap: $spacing-md;
  }

  .pro-member-banner__icon {
    flex-shrink: 0;
    width: 72rpx;
    height: 72rpx;
  }

  .pro-member-banner__text {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    gap: 6rpx;
  }

  .pro-member-banner__title {
    color: $color-text-inverse;
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
  }

  .pro-member-banner__desc {
    color: rgba(255, 255, 255, 0.65);
    font-size: $font-size-xs;
    line-height: 1.4;
  }

  .pro-member-banner__btn {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    padding: 12rpx 24rpx;
    border-radius: 999rpx;
    background: linear-gradient(135deg, #fdcb6e 0%, #f39c12 100%);
  }

  .pro-member-banner__btn-text {
    color: #2d3436;
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    white-space: nowrap;
  }
</style>
