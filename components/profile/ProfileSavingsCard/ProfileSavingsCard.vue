<template>
  <view class="profile-savings-card">
    <image class="profile-savings-card__bg" :src="savingsBgIcon" mode="aspectFit" />
    <view class="profile-savings-card__content">
      <view class="profile-savings-card__body">
        <text class="profile-savings-card__label">{{ $t('profile.monthlySaved') }}</text>
        <text class="profile-savings-card__value">{{ formattedSavedTokens }}</text>
      </view>
      <text class="profile-savings-card__remark">{{ displayRemark }}</text>
    </view>
  </view>
</template>

<script>
  import { getProfileIcon } from '@/constants/profileIcons.js';
  import { formatToken } from '@/utils/format.js';

  export default {
    name: 'ProfileSavingsCard',
    props: {
      savedTokens: {
        type: Number,
        default: 0,
      },
      plannedTokens: {
        type: Number,
        default: null,
      },
      consumedTokens: {
        type: Number,
        default: null,
      },
      remark: {
        type: String,
        default: '',
      },
    },
    computed: {
      savingsBgIcon() {
        return getProfileIcon('savingsBg');
      },
      formattedSavedTokens() {
        return formatToken(this.savedTokens);
      },
      displayRemark() {
        void this.$store.state.preferenceRevision;
        if (this.remark) {
          return this.remark;
        }

        if (this.plannedTokens != null && this.consumedTokens != null && this.plannedTokens > 0) {
          return this.$t('profile.savedHintBudget', {
            budget: formatToken(this.plannedTokens),
            actual: formatToken(this.consumedTokens),
          });
        }

        return this.$t('profile.savedHintDefault');
      },
    },
  };
</script>

<style lang="scss" scoped>
  .profile-savings-card {
    position: relative;
    margin-top: $spacing-md;
    padding: $spacing-lg;
    overflow: hidden;
    border-radius: $radius-card;
    background: linear-gradient(135deg, rgba(108, 92, 231, 0.08) 0%, rgba(9, 132, 227, 0.08) 100%);
  }

  .profile-savings-card__bg {
    position: absolute;
    top: 50%;
    right: -8rpx;
    width: 240rpx;
    height: 180rpx;
    opacity: 0.55;
    transform: translateY(-50%);
    pointer-events: none;
  }

  .profile-savings-card__content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    max-width: calc(100% - 180rpx);
    gap: $spacing-sm;
  }

  .profile-savings-card__body {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  .profile-savings-card__label {
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }

  .profile-savings-card__value {
    color: $color-primary;
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    line-height: 1.2;
  }

  .profile-savings-card__remark {
    color: $color-text-placeholder;
    font-size: $font-size-xs;
    line-height: 1.5;
  }
</style>
