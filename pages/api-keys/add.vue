<template>
  <view class="page" :class="appShellClass" :style="appShellStyle">
    <nav-bar :title="$t('apiKeys.addTitle')" />
    <view class="page__scroll-wrap">
      <scroll-view class="page__scroll" scroll-y :show-scrollbar="false">
        <view class="page__content">
          <view class="add-type-tabs">
            <view
              class="add-type-tabs__item"
              :class="{ 'add-type-tabs__item--active': providerType === builtinType }"
              @click="setProviderType(builtinType)"
            >
              <text class="add-type-tabs__text">{{ $t('apiKeys.official') }}</text>
            </view>
            <view
              class="add-type-tabs__item"
              :class="{ 'add-type-tabs__item--active': providerType === customType }"
              @click="setProviderType(customType)"
            >
              <text class="add-type-tabs__text">{{ $t('apiKeys.custom') }}</text>
            </view>
          </view>

          <view v-if="isBuiltin" class="add-platform">
            <view v-if="showPlatformSwitcher" class="add-platform-switch">
              <view
                v-for="platform in integratedPlatforms"
                :key="platform.id"
                class="add-platform-switch__item"
                :class="{ 'add-platform-switch__item--active': platform.id === form.platformId }"
                @click="onSelectPlatform(platform.id)"
              >
                <platform-icon :platform-id="platform.id" :size="72" />
              </view>
            </view>
            <view class="add-platform__main">
              <platform-icon :platform-id="form.platformId" :size="56" />
              <view class="add-platform__info">
                <text class="add-platform__name">{{ selectedPlatform.name }}</text>
                <text class="add-platform__hint">{{ $t('apiKeys.officialHint') }}</text>
              </view>
            </view>
          </view>

          <view v-else class="add-platform add-platform--custom">
            <view class="add-platform__main">
              <platform-icon
                v-if="form.logoPlatformId"
                :platform-id="form.logoPlatformId"
                :size="56"
              />
              <view v-else class="add-platform__logo-fallback">
                <u-icon name="grid-fill" color="#6C5CE7" size="28" />
              </view>
              <view class="add-platform__info">
                <text class="add-platform__name">{{ $t('apiKeys.custom') }}</text>
                <text class="add-platform__hint">{{ $t('apiKeys.customHint') }}</text>
              </view>
            </view>
            <api-key-logo-picker
              class="add-platform__picker"
              :value="form.logoPlatformId"
              @change="onLogoChange"
            />
          </view>

          <view class="add-form">
            <view class="add-form__group">
              <text
                class="add-form__label"
                :class="{ 'add-form__label--required': !isBuiltin }"
              >
                {{ aliasLabel }}
              </text>
              <view class="add-form__field">
                <input
                  class="add-form__input"
                  type="text"
                  :value="form.alias"
                  :maxlength="aliasMaxLength"
                  :placeholder="aliasPlaceholder"
                  placeholder-class="add-form__placeholder"
                  @input="onAliasInput"
                />
              </view>
              <text v-if="isCustom" class="add-form__help">{{ $t('apiKeys.customNameHelp') }}</text>
            </view>

            <template v-if="isCustom">
              <view class="add-form__group">
                <text class="add-form__label add-form__label--required">
                  {{ $t('apiKeys.chatEndpointLabel') }}
                </text>
                <view class="add-form__field">
                  <input
                    class="add-form__input add-form__input--mono"
                    type="text"
                    :value="form.chatEndpoint"
                    maxlength="256"
                    :placeholder="$t('apiKeys.chatEndpointPlaceholder')"
                    placeholder-class="add-form__placeholder"
                    @input="onChatEndpointInput"
                  />
                </view>
                <text class="add-form__help">{{ $t('apiKeys.chatEndpointHelp') }}</text>
              </view>

              <view class="add-form__group">
                <text class="add-form__label add-form__label--required">
                  {{ $t('apiKeys.balanceEndpointLabel') }}
                </text>
                <view class="add-form__field">
                  <input
                    class="add-form__input add-form__input--mono"
                    type="text"
                    :value="form.balanceEndpoint"
                    maxlength="256"
                    :placeholder="$t('apiKeys.balanceEndpointPlaceholder')"
                    placeholder-class="add-form__placeholder"
                    @input="onBalanceEndpointInput"
                  />
                </view>
                <text class="add-form__help">{{ $t('apiKeys.balanceEndpointHelp') }}</text>
              </view>

              <view class="add-form__group">
                <text class="add-form__label add-form__label--required">
                  {{ $t('apiKeys.modelsEndpointLabel') }}
                </text>
                <view class="add-form__field">
                  <input
                    class="add-form__input add-form__input--mono"
                    type="text"
                    :value="form.modelsEndpoint"
                    maxlength="256"
                    :placeholder="$t('apiKeys.modelsEndpointPlaceholder')"
                    placeholder-class="add-form__placeholder"
                    @input="onModelsEndpointInput"
                  />
                </view>
                <text class="add-form__help">{{ $t('apiKeys.modelsEndpointHelp') }}</text>
              </view>
            </template>

            <view v-if="isBuiltin" class="add-form__group">
              <text class="add-form__label">{{ $t('apiKeys.modelsEndpointLabel') }}</text>
              <text class="add-form__readonly">{{ resolvedModelsEndpoint }}</text>
              <text class="add-form__help">{{ $t('apiKeys.modelsEndpointHelp') }}</text>
            </view>

            <view v-if="isBuiltin" class="add-form__group">
              <text class="add-form__label">{{ $t('apiKeys.balanceEndpointLabel') }}</text>
              <text class="add-form__readonly">{{ resolvedBalanceEndpoint }}</text>
              <text class="add-form__help">{{ $t('apiKeys.balanceEndpointHelp') }}</text>
            </view>

            <view class="add-form__group">
              <text class="add-form__label add-form__label--required">{{ $t('apiKeys.keyLabel') }}</text>
              <view class="add-form__field">
                <input
                  class="add-form__input add-form__input--mono"
                  :password="!showKey"
                  :value="form.apiKey"
                  maxlength="256"
                  :placeholder="keyPlaceholder"
                  placeholder-class="add-form__placeholder"
                  @input="onKeyInput"
                />
                <view class="add-form__eye" @click="showKey = !showKey">
                  <u-icon :name="showKey ? 'eye' : 'eye-off'" color="#636E72" size="18" />
                </view>
              </view>
              <text class="add-form__help">{{ $t('apiKeys.keyHelp') }}</text>
            </view>

            <view class="add-form__group">
              <text class="add-form__label">{{ $t('apiKeys.expireLabel') }}</text>
              <view class="add-form__field">
                <input
                  class="add-form__input"
                  type="text"
                  :value="form.expireDate"
                  maxlength="32"
                  :placeholder="$t('apiKeys.expirePlaceholder')"
                  placeholder-class="add-form__placeholder"
                  @input="onExpireInput"
                />
              </view>
            </view>

            <view class="add-form__group add-form__group--storage">
              <api-key-storage-row
                :storage-type="form.storageType"
                @change="onStorageChange"
              />
            </view>
          </view>

          <view
            class="add-submit"
            :class="{ 'add-submit--disabled': saving || !canSubmit }"
            @click="onSubmit"
          >
            <text class="add-submit__text">{{ saving ? $t('common.loading') : $t('apiKeys.save') }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
  import NavBar from '@/components/base/NavBar/NavBar.vue';
  import ApiKeyLogoPicker from '@/components/api-keys/ApiKeyLogoPicker/ApiKeyLogoPicker.vue';
  import ApiKeyStorageRow from '@/components/api-keys/ApiKeyStorageRow/ApiKeyStorageRow.vue';
  import {
    getPlatformBalanceEndpoint,
    getPlatformModelsEndpoint,
  } from '@/constants/platformEndpoints.js';
  import { createApiKey } from '@/api/apiKeys.js';
  import { getPlatform } from '@/constants/platforms.js';
  import {
    getDefaultIntegratedPlatformId,
    getIntegratedPlatforms,
    LOGO_OTHER_PLATFORM_ID,
    showIntegratedPlatformSwitcher,
  } from '@/constants/integratedPlatforms.js';
  import {
    API_KEY_CUSTOM_PLATFORM_ID,
    API_KEY_PROVIDER,
    API_KEY_STORAGE,
    isValidHttpUrl,
  } from '@/utils/apiKey.js';
  import { getApiKeyErrorMessage } from '@/utils/apiKeyErrors.js';

  export default {
    name: 'ApiKeyAddPage',
    components: {
      NavBar,
      ApiKeyLogoPicker,
      ApiKeyStorageRow,
    },
    data() {
      const defaultPlatformId = getDefaultIntegratedPlatformId();
      return {
        providerType: API_KEY_PROVIDER.BUILTIN,
        builtinType: API_KEY_PROVIDER.BUILTIN,
        customType: API_KEY_PROVIDER.CUSTOM,
        integratedPlatforms: getIntegratedPlatforms(),
        showPlatformSwitcher: showIntegratedPlatformSwitcher(),
        form: {
          platformId: defaultPlatformId,
          alias: '',
          apiKey: '',
          expireDate: '',
          storageType: API_KEY_STORAGE.LOCAL,
          chatEndpoint: '',
          balanceEndpoint: '',
          modelsEndpoint: '',
          logoPlatformId: defaultPlatformId,
        },
        showKey: false,
        saving: false,
      };
    },
    computed: {
      isBuiltin() {
        return this.providerType === API_KEY_PROVIDER.BUILTIN;
      },
      isCustom() {
        return this.providerType === API_KEY_PROVIDER.CUSTOM;
      },
      selectedPlatform() {
        return getPlatform(this.form.platformId);
      },
      aliasLabel() {
        return this.isBuiltin ? this.$t('apiKeys.aliasLabel') : this.$t('apiKeys.customNameLabel');
      },
      aliasPlaceholder() {
        if (this.isBuiltin) {
          return this.$t('apiKeys.aliasPlaceholderOfficial', {
            name: this.selectedPlatform.name,
          });
        }
        return this.$t('apiKeys.customNamePlaceholder');
      },
      aliasMaxLength() {
        return this.isCustom ? 64 : 32;
      },
      keyPlaceholder() {
        return this.isBuiltin
          ? this.$t('apiKeys.keyPlaceholder')
          : this.$t('apiKeys.customKeyPlaceholder');
      },
      resolvedModelsEndpoint() {
        if (this.isCustom) {
          return String(this.form.modelsEndpoint || '').trim();
        }
        return getPlatformModelsEndpoint(this.form.platformId);
      },
      resolvedBalanceEndpoint() {
        return getPlatformBalanceEndpoint(this.form.platformId);
      },
      canSubmit() {
        const apiKey = String(this.form.apiKey).trim();
        if (!apiKey) {
          return false;
        }
        if (this.isBuiltin) {
          return apiKey.length >= 8;
        }
        const alias = String(this.form.alias).trim();
        return (
          !!alias &&
          !!this.form.logoPlatformId &&
          isValidHttpUrl(this.form.chatEndpoint) &&
          isValidHttpUrl(this.form.balanceEndpoint) &&
          isValidHttpUrl(this.form.modelsEndpoint)
        );
      },
    },
    onLoad(query) {
      if (query?.type === API_KEY_PROVIDER.CUSTOM) {
        this.providerType = API_KEY_PROVIDER.CUSTOM;
        this.form.logoPlatformId = LOGO_OTHER_PLATFORM_ID;
      }
    },
    methods: {
      setProviderType(type) {
        if (
          type === API_KEY_PROVIDER.CUSTOM &&
          this.form.logoPlatformId === getDefaultIntegratedPlatformId()
        ) {
          this.form.logoPlatformId = LOGO_OTHER_PLATFORM_ID;
        }
        this.providerType = type;
      },
      onSelectPlatform(platformId) {
        this.form.platformId = platformId;
      },
      onLogoChange(platformId) {
        this.form.logoPlatformId = platformId;
      },
      onAliasInput(event) {
        this.form.alias = event.detail.value;
      },
      onKeyInput(event) {
        this.form.apiKey = event.detail.value;
      },
      onExpireInput(event) {
        this.form.expireDate = event.detail.value;
      },
      onChatEndpointInput(event) {
        this.form.chatEndpoint = event.detail.value;
      },
      onBalanceEndpointInput(event) {
        this.form.balanceEndpoint = event.detail.value;
      },
      onModelsEndpointInput(event) {
        this.form.modelsEndpoint = event.detail.value;
      },
      onStorageChange(storageType) {
        this.form.storageType = storageType;
      },
      getSubmitErrorMessage() {
        if (this.isBuiltin) {
          return this.$t('apiKeys.keyRequired');
        }
        if (!String(this.form.alias).trim()) {
          return this.$t('apiKeys.customNameRequired');
        }
        if (!this.form.logoPlatformId) {
          return this.$t('apiKeys.logoRequired');
        }
        if (!isValidHttpUrl(this.form.chatEndpoint)) {
          return this.$t('apiKeys.chatEndpointRequired');
        }
        if (!isValidHttpUrl(this.form.balanceEndpoint)) {
          return this.$t('apiKeys.balanceEndpointRequired');
        }
        if (!isValidHttpUrl(this.form.modelsEndpoint)) {
          return this.$t('apiKeys.modelsEndpointRequired');
        }
        if (!String(this.form.apiKey).trim()) {
          return this.$t('apiKeys.keyRequired');
        }
        return this.$t('apiKeys.customRequired');
      },
      async onSubmit() {
        if (this.saving || !this.canSubmit) {
          if (!this.canSubmit) {
            uni.showToast({
              title: this.getSubmitErrorMessage(),
              icon: 'none',
            });
          }
          return;
        }

        this.saving = true;
        try {
          const payload = {
            alias: this.form.alias,
            apiKey: this.form.apiKey.trim(),
            expireDate: this.form.expireDate,
            storageType: this.form.storageType,
            providerType: this.providerType,
          };

          if (this.isBuiltin) {
            payload.platformId = this.form.platformId;
          } else {
            payload.platformId = API_KEY_CUSTOM_PLATFORM_ID;
            payload.chatEndpoint = this.form.chatEndpoint.trim();
            payload.balanceEndpoint = this.form.balanceEndpoint.trim();
            payload.modelsEndpoint = this.form.modelsEndpoint.trim();
            payload.logoPlatformId = this.form.logoPlatformId;
          }

          const created = await createApiKey(payload);
          uni.showToast({
            title: this.$t('common.saved'),
            icon: 'success',
          });
          setTimeout(() => {
            uni.redirectTo({
              url: `/pages/api-keys/detail?id=${created.id}`,
            });
          }, 320);
        } catch (error) {
          uni.showToast({
            title: getApiKeyErrorMessage(error?.code, this.$store.state.locale),
            icon: 'none',
          });
        } finally {
          this.saving = false;
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

  .add-type-tabs {
    display: flex;
    padding: 6rpx;
    border-radius: $radius-button;
    background-color: $color-bg-muted;
    gap: 6rpx;
  }

  .add-type-tabs__item {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    height: 72rpx;
    border-radius: $radius-button;
  }

  .add-type-tabs__item--active {
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
  }

  .add-type-tabs__text {
    color: $color-text-secondary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }

  .add-type-tabs__item--active .add-type-tabs__text {
    color: $color-text-primary;
    font-weight: $font-weight-semibold;
  }

  .add-platform {
    display: flex;
    flex-direction: column;
    margin-top: $spacing-md;
    padding: $spacing-lg;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
    gap: $spacing-md;
  }

  .add-platform--custom {
    gap: $spacing-lg;
  }

  .add-platform__main {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  .add-platform-switch {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
    padding-bottom: $spacing-sm;
    border-bottom: 1rpx solid $color-bg-muted;
  }

  .add-platform-switch__item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 96rpx;
    height: 96rpx;
    border: 2rpx solid transparent;
    border-radius: 20rpx;
    background-color: $color-bg-muted;
  }

  .add-platform-switch__item--active {
    border-color: $color-primary;
    background-color: rgba(9, 132, 227, 0.08);
  }

  .add-platform__info {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6rpx;
  }

  .add-platform__name {
    color: $color-text-primary;
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
  }

  .add-platform__hint {
    color: $color-text-secondary;
    font-size: $font-size-sm;
    line-height: 1.5;
  }

  .add-platform__logo-fallback {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 112rpx;
    height: 112rpx;
    border-radius: 24rpx;
    background-color: rgba(108, 92, 231, 0.08);
  }

  .add-platform__picker {
    padding-top: $spacing-xs;
    border-top: 1rpx solid $color-bg-muted;
  }

  .add-form {
    margin-top: $spacing-md;
    padding: $spacing-lg;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
  }

  .add-form__group + .add-form__group {
    margin-top: $spacing-lg;
  }

  .add-form__label {
    display: block;
    margin-bottom: $spacing-sm;
    color: $color-text-primary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }

  .add-form__label--required::after {
    margin-left: 4rpx;
    color: $color-danger;
    content: '*';
  }

  .add-form__field {
    display: flex;
    align-items: center;
    min-height: 88rpx;
    padding: 0 $spacing-md;
    border-radius: $radius-button;
    background-color: $color-bg-muted;
    gap: $spacing-sm;
  }

  .add-form__input {
    flex: 1;
    min-width: 0;
    height: 88rpx;
    color: $color-text-primary;
    font-size: $font-size-base;
    line-height: 88rpx;
  }

  .add-form__input--mono {
    font-family: monospace;
    font-size: $font-size-sm;
  }

  .add-form__placeholder {
    color: $color-text-placeholder;
    font-size: $font-size-base;
  }

  .add-form__eye {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 56rpx;
    height: 56rpx;
  }

  .add-form__help {
    display: block;
    margin-top: $spacing-xs;
    color: $color-text-secondary;
    font-size: $font-size-xs;
    line-height: 1.5;
  }

  .add-form__readonly {
    display: block;
    padding: $spacing-sm $spacing-md;
    border-radius: $radius-button;
    background-color: $color-bg-muted;
    color: $color-text-secondary;
    font-size: $font-size-sm;
    font-family: monospace;
    word-break: break-all;
  }

  .add-form__group--storage {
    margin-top: $spacing-lg;
    padding-top: $spacing-lg;
    border-top: 1rpx solid $color-bg-muted;
  }

  .add-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 96rpx;
    margin-top: $spacing-xl;
    border-radius: $radius-button;
    background: $color-primary-gradient;
    box-shadow: $shadow-button;
  }

  .add-submit--disabled {
    opacity: 0.55;
    pointer-events: none;
  }

  .add-submit__text {
    color: $color-text-inverse;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
  }
</style>
