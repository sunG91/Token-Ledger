<template>
  <view class="api-key-storage-row">
    <view class="api-key-storage-row__info">
      <text class="api-key-storage-row__label">{{ $t('apiKeys.storeToCloud') }}</text>
      <text class="api-key-storage-row__status" :class="statusClass">{{ statusText }}</text>
    </view>
    <u-switch
      :value="isCloud"
      active-color="#6C5CE7"
      size="20"
      @change="onChange"
    />
  </view>
</template>

<script>
  import { API_KEY_STORAGE } from '@/utils/apiKey.js';

  export default {
    name: 'ApiKeyStorageRow',
    props: {
      storageType: {
        type: String,
        default: API_KEY_STORAGE.LOCAL,
      },
    },
    computed: {
      isCloud() {
        return this.storageType === API_KEY_STORAGE.CLOUD;
      },
      statusText() {
        return this.isCloud
          ? this.$t('apiKeys.storageCloud')
          : this.$t('apiKeys.storageLocal');
      },
      statusClass() {
        return this.isCloud
          ? 'api-key-storage-row__status--cloud'
          : 'api-key-storage-row__status--local';
      },
    },
    methods: {
      onChange(value) {
        this.$emit('change', value ? API_KEY_STORAGE.CLOUD : API_KEY_STORAGE.LOCAL);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .api-key-storage-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-md;
  }

  .api-key-storage-row__info {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    gap: 6rpx;
  }

  .api-key-storage-row__label {
    color: $color-text-primary;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
  }

  .api-key-storage-row__status {
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
  }

  .api-key-storage-row__status--local {
    color: $color-text-secondary;
  }

  .api-key-storage-row__status--cloud {
    color: $color-primary;
  }
</style>
