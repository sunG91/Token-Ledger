<template>
  <view class="logo-picker">
    <text class="logo-picker__label">{{ $t('apiKeys.logoPickLabel') }}</text>
    <view class="logo-picker__grid">
      <view
        v-for="platformId in platformIds"
        :key="platformId"
        class="logo-picker__item"
        :class="{ 'logo-picker__item--active': platformId === value }"
        @click="onSelect(platformId)"
      >
        <platform-icon :platform-id="platformId" :size="72" />
      </view>
    </view>
  </view>
</template>

<script>
  import { LOGO_PICKABLE_PLATFORM_IDS } from '@/constants/integratedPlatforms.js';

  export default {
    name: 'ApiKeyLogoPicker',
    props: {
      value: {
        type: String,
        default: '',
      },
      platformIds: {
        type: Array,
        default: () => LOGO_PICKABLE_PLATFORM_IDS,
      },
    },
    methods: {
      onSelect(platformId) {
        this.$emit('input', platformId);
        this.$emit('change', platformId);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .logo-picker__label {
    display: block;
    margin-bottom: $spacing-sm;
    color: $color-text-primary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }

  .logo-picker__grid {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
  }

  .logo-picker__item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 96rpx;
    height: 96rpx;
    border: 2rpx solid transparent;
    border-radius: 20rpx;
    background-color: $color-bg-muted;
  }

  .logo-picker__item--active {
    border-color: $color-primary;
    background-color: rgba(9, 132, 227, 0.08);
  }
</style>
