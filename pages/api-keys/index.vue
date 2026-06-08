<template>
  <view class="page" :class="appShellClass" :style="appShellStyle">
    <nav-bar :title="$t('apiKeys.title')" :right-text="$t('apiKeys.add')" @right-click="onAdd" />
    <view class="page__scroll-wrap">
      <scroll-view class="page__scroll" scroll-y :show-scrollbar="false">
        <view class="page__content">
          <view v-if="pageLoading" class="page__loading">
            <list-skeleton :count="2" />
          </view>
          <template v-else>
            <view v-if="!apiKeys.length" class="page__empty">
              <view class="page__empty-icon">
                <u-icon name="lock-fill" color="#0984E3" size="40" />
              </view>
              <text class="page__empty-title">{{ $t('apiKeys.emptyTitle') }}</text>
              <text class="page__empty-desc">{{ $t('apiKeys.emptyDesc') }}</text>
              <view class="page__empty-btn" @click="onAdd">
                <text class="page__empty-btn-text">{{ $t('apiKeys.add') }}</text>
              </view>
            </view>
            <template v-else>
              <api-key-card
                v-for="item in apiKeys"
                :key="item.id"
                class="page__card"
                :item="item"
                @toggle="onToggle"
                @click="onCardClick"
              />
            </template>
            <api-key-tips-card class="page__tips" :tips="tips" />
          </template>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
  import NavBar from '@/components/base/NavBar/NavBar.vue';
  import ListSkeleton from '@/components/base/ListSkeleton/ListSkeleton.vue';
  import ApiKeyCard from '@/components/api-keys/ApiKeyCard/ApiKeyCard.vue';
  import ApiKeyTipsCard from '@/components/api-keys/ApiKeyTipsCard/ApiKeyTipsCard.vue';
  import { API_KEY_BALANCE_SYNCED_EVENT } from '@/api/apiKeyBalance.js';
  import { fetchApiKeys, updateApiKeyEnabled } from '@/api/apiKeys.js';
  import { getApiKeyErrorMessage } from '@/utils/apiKeyErrors.js';

  export default {
    name: 'ApiKeysPage',
    components: {
      NavBar,
      ListSkeleton,
      ApiKeyCard,
      ApiKeyTipsCard,
    },
    data() {
      return {
        pageLoading: true,
        apiKeys: [],
      };
    },
    computed: {
      tips() {
        return [this.$t('apiKeys.tip1'), this.$t('apiKeys.tip2'), this.$t('apiKeys.tip3')];
      },
    },
    onReady() {
      this.loadApiKeys();
    },
    mounted() {
      uni.$on('app-locale-changed', this.onLocaleChanged);
      uni.$on(API_KEY_BALANCE_SYNCED_EVENT, this.onBalanceSynced);
    },
    beforeDestroy() {
      uni.$off('app-locale-changed', this.onLocaleChanged);
      uni.$off(API_KEY_BALANCE_SYNCED_EVENT, this.onBalanceSynced);
    },
    onShow() {
      if (!this.pageLoading) {
        this.loadApiKeys();
      }
    },
    methods: {
      onLocaleChanged() {
        if (!this.pageLoading) {
          this.loadApiKeys();
        }
      },
      onBalanceSynced(payload = {}) {
        const { apiKeyId, record } = payload;
        if (!apiKeyId || !record) {
          return;
        }
        const index = this.apiKeys.findIndex((item) => item.id === apiKeyId);
        if (index === -1) {
          return;
        }
        this.$set(this.apiKeys, index, {
          ...this.apiKeys[index],
          ...record,
        });
      },
      async loadApiKeys() {
        this.pageLoading = true;
        try {
          this.apiKeys = await fetchApiKeys();
        } finally {
          this.pageLoading = false;
        }
      },
      async onToggle({ id, enabled }) {
        const index = this.apiKeys.findIndex((item) => item.id === id);
        if (index === -1) {
          return;
        }

        const previous = this.apiKeys[index].enabled;
        this.apiKeys[index].enabled = enabled;

        try {
          await updateApiKeyEnabled(id, enabled);
        } catch (error) {
          this.apiKeys[index].enabled = previous;
          uni.showToast({
            title: getApiKeyErrorMessage(error?.code, this.$store.state.locale),
            icon: 'none',
          });
        }
      },
      onAdd() {
        uni.navigateTo({
          url: '/pages/api-keys/add',
        });
      },
      onCardClick(item) {
        uni.navigateTo({
          url: `/pages/api-keys/detail?id=${item.id}`,
        });
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

  .page__card {
    display: block;
    margin-bottom: $spacing-md;
  }

  .page__tips {
    display: block;
    margin-top: $spacing-sm;
  }

  .page__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $spacing-xl $spacing-lg;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
    text-align: center;
  }

  .page__empty-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 120rpx;
    height: 120rpx;
    border-radius: 28rpx;
    background-color: rgba(9, 132, 227, 0.1);
  }

  .page__empty-title {
    margin-top: $spacing-md;
    color: $color-text-primary;
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
  }

  .page__empty-desc {
    margin-top: $spacing-sm;
    color: $color-text-secondary;
    font-size: $font-size-sm;
    line-height: 1.6;
  }

  .page__empty-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 240rpx;
    height: 80rpx;
    margin-top: $spacing-lg;
    padding: 0 $spacing-xl;
    border-radius: $radius-button;
    background: $color-primary-gradient;
    box-shadow: $shadow-button;
  }

  .page__empty-btn-text {
    color: $color-text-inverse;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
  }
</style>
