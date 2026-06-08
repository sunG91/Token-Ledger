<template>
  <view class="platform-icon" :style="wrapStyle">
    <image v-if="iconSrc" class="platform-icon__img" :src="iconSrc" mode="aspectFit" />
    <view v-else class="platform-icon__fallback">
      <u-icon name="grid-fill" color="#636E72" :size="fallbackIconSize" />
    </view>
  </view>
</template>

<script>
  import { getPlatform } from '@/constants/platforms.js';
  import { resolveStaticAsset } from '@/utils/staticAsset.js';

  export default {
    name: 'PlatformIcon',
    props: {
      platformId: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        default: 80,
      },
    },
    computed: {
      platform() {
        return getPlatform(this.platformId);
      },
      iconSrc() {
        return resolveStaticAsset(this.platform.icon);
      },
      wrapStyle() {
        const size = `${this.size}rpx`;
        return {
          width: size,
          height: size,
          backgroundColor: this.platform.bgColor,
        };
      },
      fallbackIconSize() {
        return Math.max(Math.floor(this.size * 0.36), 18);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .platform-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 20rpx;
  }

  .platform-icon__img {
    width: 52rpx;
    height: 52rpx;
  }

  .platform-icon__fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
</style>
