<template>
  <view class="page" :class="appShellClass" :style="appShellStyle">
    <nav-bar :title="$t('settings.localModeTitle')" />
    <view class="page__scroll-wrap">
      <scroll-view class="page__scroll" scroll-y :show-scrollbar="false">
        <view class="page__content">
          <view class="local-mode-status">
            <text class="local-mode-status__label">{{ $t('settings.localModeCurrent') }}</text>
            <text class="local-mode-status__value">{{ currentModeLabel }}</text>
          </view>

          <text v-if="fromSwitch" class="local-mode-hint">{{ $t('settings.localModeSwitchHint') }}</text>
          <text class="local-mode-desc">{{ $t('dataMode.localSetupDesc') }}</text>

          <api-key-model-binding-panel
            ref="bindingPanel"
            :confirm-text="$t('dataMode.localEnable')"
            :initial-key-id="initialKeyId"
            @confirm="onConfirm"
          />

          <view
            v-if="isLocalMode"
            class="local-mode-cloud"
            @click="onSwitchCloud"
          >
            <text class="local-mode-cloud__text">{{ $t('settings.switchToCloud') }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
  import { mapState } from 'vuex';
  import NavBar from '@/components/base/NavBar/NavBar.vue';
  import ApiKeyModelBindingPanel from '@/components/settings/ApiKeyModelBindingPanel/ApiKeyModelBindingPanel.vue';
  import { saveLocalModeBinding, tryEnableLocalMode } from '@/api/localMode.js';
  import { DATA_MODES } from '@/constants/appMode.js';
  import { getDataModeLabel } from '@/utils/appMode.js';
  import { getLocalModeConfig } from '@/utils/localModeConfig.js';
  import { formatPlatformApiError } from '@/utils/platformApiErrors.js';

  export default {
    name: 'SettingsLocalModePage',
    components: {
      NavBar,
      ApiKeyModelBindingPanel,
    },
    data() {
      return {
        fromSwitch: false,
        initialKeyId: '',
      };
    },
    computed: {
      ...mapState(['dataMode']),
      isLocalMode() {
        return this.dataMode !== DATA_MODES.CLOUD;
      },
      currentModeLabel() {
        return getDataModeLabel(this.dataMode);
      },
    },
    onLoad(query) {
      this.fromSwitch = query?.from === 'switch';
      this.initialKeyId = getLocalModeConfig().apiKeyId || '';
    },
    async onShow() {
      if (!this.isLocalMode) {
        return;
      }
      const result = await tryEnableLocalMode();
      if (!result.ok) {
        const title = result.error
          ? formatPlatformApiError(result.error, this.$store.state.locale)
          : this.$t('dataMode.localModelUnavailable');
        uni.showToast({ title, icon: 'none' });
      }
    },
    methods: {
      async onConfirm(payload) {
        try {
          await saveLocalModeBinding(payload);
          this.$store.commit('SET_DATA_MODE', DATA_MODES.LOCAL);
          uni.showToast({
            title: this.$t('dataMode.switched', { mode: getDataModeLabel(DATA_MODES.LOCAL) }),
            icon: 'none',
          });
          if (this.fromSwitch) {
            setTimeout(() => {
              uni.navigateBack();
            }, 400);
          }
        } catch (error) {
          uni.showToast({
            title: formatPlatformApiError(error, this.$store.state.locale),
            icon: 'none',
          });
        } finally {
          this.$refs.bindingPanel?.finishSaving();
        }
      },
      onSwitchCloud() {
        this.$store.commit('SET_DATA_MODE', DATA_MODES.CLOUD);
        uni.showToast({
          title: this.$t('dataMode.switched', { mode: getDataModeLabel(DATA_MODES.CLOUD) }),
          icon: 'none',
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

  .local-mode-status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-md;
    padding: $spacing-md $spacing-lg;
    border-radius: $radius-card;
    background-color: $color-bg-card;
  }

  .local-mode-status__label {
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }

  .local-mode-status__value {
    color: $color-text-primary;
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
  }

  .local-mode-hint {
    display: block;
    margin-bottom: $spacing-sm;
    color: #6c5ce7;
    font-size: $font-size-sm;
    line-height: 1.6;
  }

  .local-mode-desc {
    display: block;
    margin-bottom: $spacing-lg;
    color: $color-text-secondary;
    font-size: $font-size-sm;
    line-height: 1.6;
  }

  .local-mode-cloud {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: $spacing-lg;
    padding: $spacing-md;
  }

  .local-mode-cloud__text {
    color: $color-secondary;
    font-size: $font-size-sm;
  }
</style>
