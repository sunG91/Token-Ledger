<template>
  <view class="api-key-avatar" :style="wrapStyle">
    <platform-icon
      v-if="displayPlatformId"
      :platform-id="displayPlatformId"
      :size="size"
    />
    <view v-else class="api-key-avatar__custom">
      <u-icon name="setting-fill" color="#6C5CE7" :size="iconSize" />
    </view>
  </view>
</template>

<script>
  import { isCustomApiKey } from '@/utils/apiKey.js';
  import { resolveApiKeyLogoPlatformId } from '@/utils/apiKeyLogo.js';

  export default {
    name: 'ApiKeyAvatar',
    props: {
      item: {
        type: Object,
        required: true,
      },
      size: {
        type: Number,
        default: 48,
      },
    },
    computed: {
      isCustom() {
        return isCustomApiKey(this.item);
      },
      displayPlatformId() {
        return resolveApiKeyLogoPlatformId(this.item);
      },
      iconSize() {
        return Math.max(Math.floor(this.size * 0.42), 16);
      },
      wrapStyle() {
        if (this.displayPlatformId) {
          return {};
        }
        const size = `${this.size}rpx`;
        return {
          width: size,
          height: size,
          backgroundColor: 'rgba(108, 92, 231, 0.1)',
        };
      },
    },
  };
</script>

<style lang="scss" scoped>
  .api-key-avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 20rpx;
  }

  .api-key-avatar__custom {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
</style>
