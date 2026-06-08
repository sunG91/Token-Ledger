<template>
  <view class="page" :class="appShellClass" :style="appShellStyle">
    <nav-bar :title="$t('apiKeys.detailTitle')" />
    <view class="page__scroll-wrap">
      <scroll-view class="page__scroll" scroll-y :show-scrollbar="false">
        <view class="page__content">
          <view v-if="pageLoading" class="page__loading">
            <list-skeleton :count="2" />
          </view>
          <template v-else-if="item">
            <view class="detail-card">
              <view class="detail-card__header">
                <api-key-avatar :item="item" :size="56" />
                <view class="detail-card__info">
                  <text class="detail-card__alias">{{ displayAlias }}</text>
                  <text class="detail-card__masked">{{ item.maskedKey }}</text>
                </view>
                <u-switch
                  :value="item.enabled"
                  active-color="#0984E3"
                  size="20"
                  @change="onToggle"
                />
              </view>
              <view class="detail-card__meta">
                <view class="detail-card__meta-row">
                  <text class="detail-card__meta-label">{{ $t('apiKeys.officialBalance') }}</text>
                  <text class="detail-card__meta-value">{{ balanceLabel }}</text>
                </view>
                <view class="detail-card__meta-row">
                  <text class="detail-card__meta-label">{{ $t('apiKeys.expireDate') }}</text>
                  <text class="detail-card__meta-value">{{ expireLabel }}</text>
                </view>
                <view class="detail-card__meta-row">
                  <text class="detail-card__meta-label">{{ $t('apiKeys.providerType') }}</text>
                  <text class="detail-card__meta-value">{{ providerLabel }}</text>
                </view>
                <view class="detail-card__meta-row">
                  <text class="detail-card__meta-label">{{ $t('apiKeys.status') }}</text>
                  <text class="detail-card__meta-value">{{ statusLabel }}</text>
                </view>
              </view>
            </view>

            <view v-if="showEndpoints" class="detail-endpoints">
              <view v-if="isCustom" class="detail-endpoints__row">
                <text class="detail-endpoints__label">{{ $t('apiKeys.chatEndpointLabel') }}</text>
                <text class="detail-endpoints__value">{{ item.chatEndpoint }}</text>
              </view>
              <view v-if="item.balanceEndpoint" class="detail-endpoints__row">
                <text class="detail-endpoints__label">{{ $t('apiKeys.balanceEndpointLabel') }}</text>
                <text class="detail-endpoints__value">{{ item.balanceEndpoint }}</text>
              </view>
              <view v-if="item.modelsEndpoint" class="detail-endpoints__row">
                <text class="detail-endpoints__label">{{ $t('apiKeys.modelsEndpointLabel') }}</text>
                <text class="detail-endpoints__value">{{ item.modelsEndpoint }}</text>
              </view>
            </view>

            <view class="detail-storage">
              <api-key-storage-row
                :storage-type="item.storageType"
                @change="onStorageChange"
              />
            </view>

            <view class="detail-actions">
              <view class="detail-actions__btn detail-actions__btn--ghost" @click="onSync">
                <u-icon name="reload" color="#0984E3" size="18" />
                <text class="detail-actions__btn-text">{{ $t('apiKeys.syncNow') }}</text>
              </view>
              <view class="detail-actions__btn detail-actions__btn--danger" @click="onDelete">
                <u-icon name="trash" color="#D63031" size="18" />
                <text class="detail-actions__btn-text detail-actions__btn-text--danger">
                  {{ $t('apiKeys.delete') }}
                </text>
              </view>
            </view>
          </template>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
  import NavBar from '@/components/base/NavBar/NavBar.vue';
  import ListSkeleton from '@/components/base/ListSkeleton/ListSkeleton.vue';
  import ApiKeyAvatar from '@/components/api-keys/ApiKeyAvatar/ApiKeyAvatar.vue';
  import ApiKeyStorageRow from '@/components/api-keys/ApiKeyStorageRow/ApiKeyStorageRow.vue';
  import { API_KEY_BALANCE_SYNCED_EVENT, syncApiKeyBalance } from '@/api/apiKeyBalance.js';
  import {
    deleteApiKey,
    fetchApiKeyById,
    updateApiKey,
    updateApiKeyEnabled,
  } from '@/api/apiKeys.js';
  import { formatPlatformApiError } from '@/utils/platformApiErrors.js';
  import { getPlatform } from '@/constants/platforms.js';
  import {
    formatApiKeyExpireDate,
    getCustomDefaultAlias,
    getCustomProviderLabel,
    getOfficialProviderLabel,
  } from '@/utils/apiKeyDisplay.js';
  import { getApiKeyErrorMessage } from '@/utils/apiKeyErrors.js';
  import { API_KEY_STORAGE, isCloudApiKey, isCustomApiKey } from '@/utils/apiKey.js';
  import { formatOfficialBalance } from '@/utils/format.js';

  export default {
    name: 'ApiKeyDetailPage',
    components: {
      NavBar,
      ListSkeleton,
      ApiKeyAvatar,
      ApiKeyStorageRow,
    },
    data() {
      return {
        pageLoading: true,
        syncing: false,
        item: null,
        keyId: '',
      };
    },
    computed: {
      displayAlias() {
        void this.$store.state.preferenceRevision;
        if (isCustomApiKey(this.item)) {
          return this.item?.alias || getCustomDefaultAlias();
        }
        return this.item?.alias || getPlatform(this.item?.platformId).name;
      },
      isCustom() {
        return isCustomApiKey(this.item);
      },
      showEndpoints() {
        return (
          this.isCustom ||
          !!this.item?.balanceEndpoint ||
          !!this.item?.modelsEndpoint
        );
      },
      providerLabel() {
        void this.$store.state.preferenceRevision;
        if (this.isCustom) {
          return getCustomProviderLabel();
        }
        return getOfficialProviderLabel(getPlatform(this.item?.platformId).name);
      },
      expireLabel() {
        void this.$store.state.preferenceRevision;
        return formatApiKeyExpireDate(this.item?.expireDate);
      },
      balanceLabel() {
        const { officialBalance, balanceCurrency } = this.item || {};
        if (officialBalance === null || officialBalance === undefined) {
          return this.$t('apiKeys.notSynced');
        }
        return formatOfficialBalance(officialBalance, balanceCurrency);
      },
      statusLabel() {
        if (!this.item) {
          return '';
        }
        if (this.item.activated) {
          return this.$t('apiKeys.activated');
        }
        return this.item.enabled ? this.$t('apiKeys.enabled') : this.$t('apiKeys.disabled');
      },
    },
    onLoad(query) {
      this.keyId = query?.id || '';
    },
    mounted() {
      uni.$on(API_KEY_BALANCE_SYNCED_EVENT, this.onBalanceSynced);
    },
    beforeDestroy() {
      uni.$off(API_KEY_BALANCE_SYNCED_EVENT, this.onBalanceSynced);
    },
    onReady() {
      this.loadDetail();
    },
    onShow() {
      if (!this.pageLoading && this.keyId) {
        this.loadDetail();
      }
    },
    methods: {
      onBalanceSynced(payload = {}) {
        const { apiKeyId, record } = payload;
        if (!this.item || apiKeyId !== this.item.id || !record) {
          return;
        }
        this.item = {
          ...this.item,
          ...record,
        };
      },
      async loadDetail() {
        if (!this.keyId) {
          this.pageLoading = false;
          return;
        }

        this.pageLoading = true;
        try {
          this.item = await fetchApiKeyById(this.keyId);
        } catch (error) {
          uni.showToast({
            title: this.$t('apiKeys.notFound'),
            icon: 'none',
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 500);
        } finally {
          this.pageLoading = false;
        }
      },
      async onToggle(enabled) {
        if (!this.item) {
          return;
        }

        const previous = this.item.enabled;
        this.item.enabled = enabled;

        try {
          this.item = await updateApiKeyEnabled(this.item.id, enabled);
        } catch (error) {
          this.item.enabled = previous;
          uni.showToast({
            title: this.$t('apiKeys.actionFail'),
            icon: 'none',
          });
        }
      },
      async onStorageChange(storageType) {
        if (!this.item) {
          return;
        }

        const previous = this.item.storageType;
        this.item.storageType = storageType;

        try {
          this.item = await updateApiKey(this.item.id, { storageType });
        } catch (error) {
          this.item.storageType = previous;
          uni.showToast({
            title: this.$t('apiKeys.actionFail'),
            icon: 'none',
          });
        }
      },
      async onSync() {
        if (!this.item || this.syncing) {
          return;
        }

        this.syncing = true;
        uni.showLoading({ title: this.$t('apiKeys.syncing'), mask: true });
        try {
          this.item = await syncApiKeyBalance(this.item.id);
          uni.showToast({
            title: this.$t('apiKeys.syncSuccess'),
            icon: 'success',
          });
        } catch (error) {
          uni.showToast({
            title: formatPlatformApiError(error, this.$store.state.locale),
            icon: 'none',
          });
        } finally {
          uni.hideLoading();
          this.syncing = false;
        }
      },
      onDelete() {
        if (!this.item) {
          return;
        }

        if (isCloudApiKey(this.item)) {
          this.confirmCloudDelete();
          return;
        }

        this.confirmLocalDelete();
      },
      confirmLocalDelete() {
        uni.showModal({
          title: this.$t('apiKeys.deleteConfirmTitle'),
          content: this.$t('apiKeys.deleteConfirmContent'),
          confirmText: this.$t('common.confirm'),
          cancelText: this.$t('common.cancel'),
          success: (res) => {
            if (!res.confirm) {
              return;
            }
            this.performDelete({
              deleteLocal: true,
              deleteCloud: false,
            });
          },
        });
      },
      confirmCloudDelete() {
        uni.showModal({
          title: this.$t('apiKeys.deleteCloudTitle'),
          content: this.$t('apiKeys.deleteCloudContent'),
          confirmText: this.$t('common.confirm'),
          cancelText: this.$t('common.cancel'),
          success: (res) => {
            if (!res.confirm) {
              return;
            }
            this.askDeleteLocalCopy();
          },
        });
      },
      askDeleteLocalCopy() {
        uni.showModal({
          title: this.$t('apiKeys.deleteLocalAlsoTitle'),
          content: this.$t('apiKeys.deleteLocalAlsoContent'),
          confirmText: this.$t('apiKeys.deleteLocalAlsoYes'),
          cancelText: this.$t('apiKeys.deleteLocalAlsoNo'),
          success: (res) => {
            this.performDelete({
              deleteLocal: !!res.confirm,
              deleteCloud: true,
            });
          },
        });
      },
      async performDelete(options) {
        try {
          const result = await deleteApiKey(this.item.id, options);

          if (result?.mode === 'cloud_only') {
            uni.showToast({
              title: this.$t('apiKeys.cloudRemovedKeepLocal'),
              icon: 'none',
            });
            this.item = {
              ...this.item,
              storageType: API_KEY_STORAGE.LOCAL,
              cloudRecordId: '',
            };
            return;
          }

          uni.showToast({
            title: this.$t('apiKeys.deleted'),
            icon: 'success',
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 320);
        } catch (error) {
          uni.showToast({
            title: getApiKeyErrorMessage(error?.code, this.$store.state.locale),
            icon: 'none',
          });
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background-color: $color-bg-page;
  }

  .page__scroll-wrap {
    flex: 1;
    min-height: 0;
    width: 100%;
  }

  .page__scroll {
    width: 100%;
    height: 100%;
  }

  .page__content {
    box-sizing: border-box;
    width: 100%;
    max-width: 750rpx;
    margin: 0 auto;
    padding: $spacing-md $spacing-lg calc(#{$spacing-xl} + #{$spacing-lg});
  }

  .page__loading {
    padding-top: $spacing-sm;
  }

  .detail-card {
    padding: $spacing-lg;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
  }

  .detail-card__header {
    display: flex;
    align-items: flex-start;
    gap: $spacing-md;
  }

  .detail-card__info {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    gap: 6rpx;
  }

  .detail-card__alias {
    color: $color-text-primary;
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
  }

  .detail-card__masked {
    color: $color-text-secondary;
    font-size: $font-size-sm;
    font-family: monospace;
  }

  .detail-card__meta {
    display: flex;
    flex-direction: column;
    margin-top: $spacing-lg;
    padding-top: $spacing-lg;
    border-top: 1rpx solid $color-bg-muted;
    gap: $spacing-md;
  }

  .detail-card__meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-md;
  }

  .detail-card__meta-label {
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }

  .detail-card__meta-value {
    color: $color-text-primary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    text-align: right;
  }

  .detail-endpoints {
    margin-top: $spacing-md;
    padding: $spacing-lg;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
    gap: $spacing-md;
  }

  .detail-endpoints__row {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .detail-endpoints__row + .detail-endpoints__row {
    margin-top: $spacing-md;
    padding-top: $spacing-md;
    border-top: 1rpx solid $color-bg-muted;
  }

  .detail-endpoints__label {
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }

  .detail-endpoints__value {
    color: $color-text-primary;
    font-size: $font-size-sm;
    font-family: monospace;
    line-height: 1.5;
    word-break: break-all;
  }

  .detail-storage {
    margin-top: $spacing-md;
    padding: $spacing-lg;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
  }

  .detail-actions {
    display: flex;
    flex-direction: column;
    margin-top: $spacing-lg;
    gap: $spacing-md;
  }

  .detail-actions__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88rpx;
    border-radius: $radius-button;
    gap: $spacing-sm;
  }

  .detail-actions__btn--ghost {
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
  }

  .detail-actions__btn--danger {
    background-color: rgba(214, 48, 49, 0.08);
  }

  .detail-actions__btn-text {
    color: $color-secondary;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
  }

  .detail-actions__btn-text--danger {
    color: $color-danger;
  }
</style>
