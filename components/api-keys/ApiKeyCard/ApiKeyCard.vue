<template>
  <view class="api-key-card" @click="onClick">
    <view class="api-key-card__header">
      <view class="api-key-card__platform">
        <api-key-avatar :item="item" :size="48" />
        <view class="api-key-card__platform-info">
          <view class="api-key-card__name-row">
            <text class="api-key-card__name">{{ displayName }}</text>
            <view v-if="isCustom" class="api-key-card__tag api-key-card__tag--custom">
              <text class="api-key-card__tag-text">{{ $t('apiKeys.custom') }}</text>
            </view>
            <view class="api-key-card__tag" :class="storageTagClass">
              <text class="api-key-card__tag-text">{{ storageLabel }}</text>
            </view>
            <view v-if="item.activated" class="api-key-card__activated">
              <text class="api-key-card__activated-text">{{ $t('apiKeys.activated') }}</text>
            </view>
          </view>
          <text class="api-key-card__masked">{{ item.maskedKey }}</text>
        </view>
      </view>
      <view class="api-key-card__switch" @click.stop>
        <u-switch
          :value="item.enabled"
          active-color="#0984E3"
          size="20"
          @change="onToggle"
        />
      </view>
    </view>
    <view class="api-key-card__meta">
      <text class="api-key-card__meta-item">{{ $t('apiKeys.officialBalance') }}: {{ balanceLabel }}</text>
      <text class="api-key-card__meta-item">{{ $t('apiKeys.expireDate') }}: {{ expireLabel }}</text>
    </view>
  </view>
</template>

<script>
  import ApiKeyAvatar from '@/components/api-keys/ApiKeyAvatar/ApiKeyAvatar.vue';
  import { getPlatform } from '@/constants/platforms.js';
  import { API_KEY_STORAGE, isCustomApiKey } from '@/utils/apiKey.js';
  import {
    formatApiKeyExpireDate,
    getCustomDefaultAlias,
  } from '@/utils/apiKeyDisplay.js';
  import { formatOfficialBalance } from '@/utils/format.js';

  export default {
    name: 'ApiKeyCard',
    components: {
      ApiKeyAvatar,
    },
    props: {
      item: {
        type: Object,
        required: true,
      },
    },
    computed: {
      displayName() {
        void this.$store.state.preferenceRevision;
        if (isCustomApiKey(this.item)) {
          return this.item.alias || getCustomDefaultAlias();
        }
        return this.item.alias || getPlatform(this.item.platformId).name;
      },
      isCustom() {
        return isCustomApiKey(this.item);
      },
      balanceLabel() {
        const { officialBalance, balanceCurrency } = this.item;
        if (officialBalance === null || officialBalance === undefined) {
          return this.$t('apiKeys.notSynced');
        }
        return formatOfficialBalance(officialBalance, balanceCurrency);
      },
      resolvedStorageType() {
        return this.item.storageType || API_KEY_STORAGE.LOCAL;
      },
      storageLabel() {
        return this.resolvedStorageType === API_KEY_STORAGE.CLOUD
          ? this.$t('apiKeys.storageCloud')
          : this.$t('apiKeys.storageLocal');
      },
      storageTagClass() {
        return this.resolvedStorageType === API_KEY_STORAGE.CLOUD
          ? 'api-key-card__tag--cloud'
          : 'api-key-card__tag--local';
      },
      expireLabel() {
        void this.$store.state.preferenceRevision;
        return formatApiKeyExpireDate(this.item.expireDate);
      },
    },
    methods: {
      onClick() {
        this.$emit('click', this.item);
      },
      onToggle(enabled) {
        this.$emit('toggle', {
          id: this.item.id,
          enabled,
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .api-key-card {
    padding: $spacing-lg;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
    transition: transform 0.15s ease;
  }

  .api-key-card:active {
    transform: scale(0.99);
  }

  .api-key-card__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: $spacing-md;
  }

  .api-key-card__platform {
    display: flex;
    flex: 1;
    align-items: flex-start;
    min-width: 0;
    gap: $spacing-md;
  }

  .api-key-card__platform-info {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    gap: 6rpx;
  }

  .api-key-card__name-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: $spacing-sm;
  }

  .api-key-card__name {
    color: $color-text-primary;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
  }

  .api-key-card__tag {
    padding: 2rpx 12rpx;
    border-radius: 999rpx;
  }

  .api-key-card__tag--local {
    background-color: $color-bg-muted;
  }

  .api-key-card__tag--cloud {
    background-color: rgba(108, 92, 231, 0.12);
  }

  .api-key-card__tag--custom {
    background-color: rgba(9, 132, 227, 0.12);
  }

  .api-key-card__tag--custom .api-key-card__tag-text {
    color: $color-secondary;
  }

  .api-key-card__tag-text {
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
  }

  .api-key-card__tag--local .api-key-card__tag-text {
    color: $color-text-secondary;
  }

  .api-key-card__tag--cloud .api-key-card__tag-text {
    color: $color-primary;
  }

  .api-key-card__activated {
    padding: 2rpx 12rpx;
    border-radius: 999rpx;
    background-color: rgba(0, 184, 148, 0.12);
  }

  .api-key-card__activated-text {
    color: $color-success;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
  }

  .api-key-card__masked {
    color: $color-text-secondary;
    font-size: $font-size-sm;
    font-family: monospace;
  }

  .api-key-card__meta {
    display: flex;
    flex-wrap: wrap;
    margin-top: $spacing-md;
    padding-top: $spacing-md;
    border-top: 1rpx solid $color-bg-muted;
    gap: $spacing-sm $spacing-lg;
  }

  .api-key-card__meta-item {
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }
</style>
