<template>
  <view class="page" :class="appShellClass" :style="appShellStyle">
    <nav-bar :title="$t('settings.chatModelTitle')" />
    <view class="page__scroll-wrap">
      <scroll-view class="page__scroll" scroll-y :show-scrollbar="false">
        <view class="page__content">
          <text class="chat-model-desc">{{ $t('settings.chatModelDesc') }}</text>
          <text class="chat-model-note">{{ $t('settings.chatModelCloudNote') }}</text>

          <api-key-model-binding-panel
            ref="bindingPanel"
            :confirm-text="$t('settings.chatModelSave')"
            :initial-key-id="initialKeyId"
            @confirm="onConfirm"
          />
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
  import NavBar from '@/components/base/NavBar/NavBar.vue';
  import ApiKeyModelBindingPanel from '@/components/settings/ApiKeyModelBindingPanel/ApiKeyModelBindingPanel.vue';
  import { saveChatModelBinding } from '@/api/chatModel.js';
  import { fetchApiKeys } from '@/api/apiKeys.js';
  import { formatPlatformApiError } from '@/utils/platformApiErrors.js';

  export default {
    name: 'SettingsChatModelPage',
    components: {
      NavBar,
      ApiKeyModelBindingPanel,
    },
    data() {
      return {
        initialKeyId: '',
      };
    },
    async onLoad() {
      try {
        const keys = await fetchApiKeys();
        const bound = keys.find((item) => item.enabled !== false && item.chatModel);
        this.initialKeyId = bound?.id || keys[0]?.id || '';
      } catch (error) {
        // ignore
      }
    },
    methods: {
      async onConfirm(payload) {
        try {
          await saveChatModelBinding(payload);
          uni.showToast({
            title: this.$t('common.saved'),
            icon: 'success',
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 400);
        } catch (error) {
          uni.showToast({
            title: formatPlatformApiError(error, this.$store.state.locale),
            icon: 'none',
          });
        } finally {
          this.$refs.bindingPanel?.finishSaving();
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

  .chat-model-desc {
    display: block;
    margin-bottom: $spacing-sm;
    color: $color-text-primary;
    font-size: $font-size-sm;
    line-height: 1.6;
  }

  .chat-model-note {
    display: block;
    margin-bottom: $spacing-lg;
    color: $color-text-placeholder;
    font-size: $font-size-xs;
    line-height: 1.6;
  }
</style>
