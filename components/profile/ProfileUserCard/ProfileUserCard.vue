<template>
  <view class="profile-user-card">
    <view class="profile-user-card__avatar">
      <text class="profile-user-card__emoji">{{ profile.avatarEmoji || '📒' }}</text>
    </view>
    <view class="profile-user-card__info">
      <view class="profile-user-card__name-row">
        <text class="profile-user-card__name">{{ profile.nickname }}</text>
        <image
          v-if="profile.isPro"
          class="profile-user-card__status"
          :src="memberStatusIcon"
          mode="aspectFit"
        />
      </view>
      <text class="profile-user-card__id">ID: {{ profile.userId }}</text>
    </view>
  </view>
</template>

<script>
  import { getProfileIcon } from '@/constants/profileIcons.js';

  export default {
    name: 'ProfileUserCard',
    props: {
      profile: {
        type: Object,
        default: () => ({}),
      },
    },
    computed: {
      memberStatusIcon() {
        return getProfileIcon('memberStatus');
      },
    },
  };
</script>

<style lang="scss" scoped>
  .profile-user-card {
    display: flex;
    align-items: center;
    padding: $spacing-lg;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
    gap: $spacing-md;
  }

  .profile-user-card__avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 112rpx;
    height: 112rpx;
    border-radius: $radius-circle;
    background: $color-avatar-bg;
  }

  .profile-user-card__emoji {
    font-size: 56rpx;
    line-height: 1;
  }

  .profile-user-card__info {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    gap: 8rpx;
  }

  .profile-user-card__name-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: $spacing-sm;
  }

  .profile-user-card__name {
    color: $color-text-primary;
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
  }

  .profile-user-card__status {
    width: 88rpx;
    height: 36rpx;
  }

  .profile-user-card__id {
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }
</style>
