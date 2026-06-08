<template>
  <u-popup :show="show" mode="bottom" round="16" @close="onClose">
    <view class="local-setup">
      <view class="local-setup__header">
        <text class="local-setup__title">{{ $t('dataMode.localSetupTitle') }}</text>
        <text class="local-setup__desc">{{ setupDesc }}</text>
      </view>

      <scroll-view class="local-setup__body" scroll-y :style="{ maxHeight: bodyMaxHeight + 'px' }">
        <view v-if="pageLoading" class="local-setup__loading">
          <text class="local-setup__loading-text">{{ $t('common.loading') }}</text>
        </view>

        <template v-else-if="!candidateKeys.length">
          <view class="local-setup__empty">
            <text class="local-setup__empty-text">{{ $t('dataMode.localNeedApiKey') }}</text>
            <view class="local-setup__btn local-setup__btn--primary" @click="onAddKey">
              <text class="local-setup__btn-text">{{ $t('assistant.addApiKey') }}</text>
            </view>
          </view>
        </template>

        <template v-else>
          <view class="local-setup__section">
            <text class="local-setup__label">{{ $t('dataMode.localPickKey') }}</text>
            <view class="local-setup__keys">
              <view
                v-for="item in candidateKeys"
                :key="item.id"
                class="local-setup__key"
                :class="{ 'local-setup__key--active': item.id === selectedKeyId }"
                @click="onSelectKey(item)"
              >
                <api-key-avatar :item="item" :size="40" />
                <view class="local-setup__key-info">
                  <text class="local-setup__key-name">{{ item.alias || item.maskedKey }}</text>
                  <text class="local-setup__key-mask">{{ item.maskedKey }}</text>
                </view>
              </view>
            </view>
          </view>

          <view class="local-setup__section">
            <text class="local-setup__label add-form__label--required">
              {{ $t('apiKeys.modelsEndpointLabel') }}
            </text>
            <view class="local-setup__field">
              <input
                class="local-setup__input"
                type="text"
                :disabled="!modelsEndpointEditable"
                :value="modelsEndpoint"
                maxlength="256"
                :placeholder="$t('apiKeys.modelsEndpointPlaceholder')"
                placeholder-class="local-setup__placeholder"
                @input="onModelsEndpointInput"
              />
            </view>
            <text class="local-setup__help">{{ $t('apiKeys.modelsEndpointHelp') }}</text>
          </view>

          <view class="local-setup__fetch-row">
            <view
              class="local-setup__btn local-setup__btn--ghost"
              :class="{ 'local-setup__btn--disabled': fetching || !canFetch }"
              @click="onFetchModels"
            >
              <text class="local-setup__btn-text local-setup__btn-text--ghost">
                {{ fetching ? $t('dataMode.localFetchingModels') : $t('apiKeys.fetchModels') }}
              </text>
            </view>
          </view>

          <text v-if="fetchError" class="local-setup__error">{{ fetchError }}</text>

          <api-key-remote-model-picker
            :models="remoteModels"
            :value="selectedChatModel"
            :label="$t('dataMode.localSelectModel')"
            :max-height="240"
            :show-default-option="showDefaultModelOption"
            @change="selectedChatModel = $event"
          />
        </template>
      </scroll-view>

      <view class="local-setup__footer" :style="{ paddingBottom: safeBottom + 'px' }">
        <view class="local-setup__btn local-setup__btn--ghost" @click="onClose">
          <text class="local-setup__btn-text local-setup__btn-text--ghost">{{ $t('common.cancel') }}</text>
        </view>
        <view
          v-if="candidateKeys.length"
          class="local-setup__btn local-setup__btn--primary"
          :class="{ 'local-setup__btn--disabled': saving || !canConfirm }"
          @click="onConfirm"
        >
          <text class="local-setup__btn-text">
            {{ saving ? $t('common.loading') : $t('dataMode.localEnable') }}
          </text>
        </view>
      </view>
    </view>
  </u-popup>
</template>

<script>
  import ApiKeyAvatar from '@/components/api-keys/ApiKeyAvatar/ApiKeyAvatar.vue';
  import ApiKeyRemoteModelPicker from '@/components/api-keys/ApiKeyRemoteModelPicker/ApiKeyRemoteModelPicker.vue';
  import {
    fetchModelsForApiKeyRecord,
    loadLocalModeCandidateKeys,
    LOCAL_MODE_ERROR,
    saveLocalModeBinding,
  } from '@/api/localMode.js';
  import { fetchApiKeySecretById } from '@/utils/apiKeyRepository.js';
  import { isCustomApiKey, isValidHttpUrl } from '@/utils/apiKey.js';
  import { getLocalModeConfig, resolveModelsEndpoint } from '@/utils/localModeConfig.js';
  import { formatPlatformApiError } from '@/utils/platformApiErrors.js';
  import {
    DEFAULT_CHAT_MODEL_SENTINEL,
    isDefaultChatModelSentinel,
  } from '@/constants/platformChatModels.js';
  import { isIntegratedPlatformId } from '@/constants/integratedPlatforms.js';
  import { getSafeAreaBottom, getWindowHeight } from '@/utils/system.js';

  export default {
    name: 'LocalModeSetupModal',
    components: {
      ApiKeyAvatar,
      ApiKeyRemoteModelPicker,
    },
    props: {
      show: {
        type: Boolean,
        default: false,
      },
      reason: {
        type: String,
        default: '',
      },
      presetKeyId: {
        type: String,
        default: '',
      },
      presetModels: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        pageLoading: false,
        saving: false,
        fetching: false,
        candidateKeys: [],
        selectedKeyId: '',
        selectedKey: null,
        modelsEndpoint: '',
        remoteModels: [],
        selectedChatModel: '',
        fetchError: '',
        safeBottom: getSafeAreaBottom(),
        bodyMaxHeight: Math.floor(getWindowHeight() * 0.58),
      };
    },
    computed: {
      setupDesc() {
        if (this.reason === LOCAL_MODE_ERROR.MODEL_UNAVAILABLE) {
          return this.$t('dataMode.localModelUnavailable');
        }
        if (this.reason === LOCAL_MODE_ERROR.FETCH_FAILED) {
          return this.$t('dataMode.localValidateFail');
        }
        return this.$t('dataMode.localSetupDesc');
      },
      modelsEndpointEditable() {
        return isCustomApiKey(this.selectedKey);
      },
      canFetch() {
        return isValidHttpUrl(this.modelsEndpoint) && !!this.selectedKeyId;
      },
      showDefaultModelOption() {
        return isIntegratedPlatformId(this.selectedKey?.platformId);
      },
      canConfirm() {
        return !!this.selectedKeyId && !!this.selectedChatModel;
      },
    },
    watch: {
      show(visible) {
        if (visible) {
          this.initSetup();
        }
      },
    },
    methods: {
      onClose() {
        this.$emit('close');
      },
      onAddKey() {
        this.onClose();
        uni.navigateTo({ url: '/pages/api-keys/add' });
      },
      async initSetup() {
        this.pageLoading = true;
        this.fetchError = '';
        this.remoteModels = [...this.presetModels];
        try {
          this.candidateKeys = await loadLocalModeCandidateKeys();
          const config = getLocalModeConfig();
          const initialId = this.presetKeyId || config.apiKeyId || this.candidateKeys[0]?.id || '';
          if (initialId) {
            await this.onSelectKey({ id: initialId }, false);
          }
        } catch (error) {
          this.fetchError = this.$t('dataMode.localValidateFail');
        } finally {
          this.pageLoading = false;
        }
      },
      async onSelectKey(item, resetModels = true) {
        this.selectedKeyId = item.id;
        this.fetchError = '';
        if (resetModels) {
          this.remoteModels = [];
          this.selectedChatModel = '';
        }
        try {
          this.selectedKey = await fetchApiKeySecretById(item.id);
          this.modelsEndpoint = resolveModelsEndpoint(this.selectedKey);
          if (this.selectedKey.chatModel) {
            this.selectedChatModel = this.selectedKey.chatModel;
          } else if (this.showDefaultModelOption) {
            this.selectedChatModel = DEFAULT_CHAT_MODEL_SENTINEL;
          }
          if (!this.remoteModels.length && this.selectedKey.chatModel && this.canFetch) {
            await this.onFetchModels();
          }
        } catch (error) {
          this.selectedKey = item;
          this.modelsEndpoint = resolveModelsEndpoint(item);
        }
      },
      onModelsEndpointInput(event) {
        this.modelsEndpoint = event.detail.value;
      },
      getFetchErrorMessage(error) {
        return formatPlatformApiError(error, this.$store.state.locale);
      },
      async onFetchModels() {
        if (this.fetching || !this.canFetch) {
          return;
        }
        this.fetching = true;
        this.fetchError = '';
        try {
          const key = await fetchApiKeySecretById(this.selectedKeyId);
          const { models } = await fetchModelsForApiKeyRecord({
            ...key,
            modelsEndpoint: this.modelsEndpoint,
          });
          this.remoteModels = models;
          if (
            this.selectedChatModel &&
            !isDefaultChatModelSentinel(this.selectedChatModel) &&
            !models.some((item) => item.id === this.selectedChatModel)
          ) {
            this.selectedChatModel = '';
          }
          if (!this.selectedChatModel) {
            this.selectedChatModel = this.showDefaultModelOption
              ? DEFAULT_CHAT_MODEL_SENTINEL
              : models[0]?.id || '';
          }
        } catch (error) {
          this.fetchError = this.getFetchErrorMessage(error);
          this.remoteModels = [];
        } finally {
          this.fetching = false;
        }
      },
      async onConfirm() {
        if (this.saving || !this.canConfirm) {
          return;
        }
        this.saving = true;
        try {
          await saveLocalModeBinding({
            apiKeyId: this.selectedKeyId,
            chatModel: this.selectedChatModel,
            modelsEndpoint: this.modelsEndpointEditable ? this.modelsEndpoint.trim() : '',
          });
          this.$emit('success');
          this.onClose();
        } catch (error) {
          uni.showToast({
            title: this.$t('dataMode.localValidateFail'),
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
  .local-setup {
    padding: $spacing-lg $spacing-lg 0;
    background-color: $color-bg-card;
  }

  .local-setup__header {
    margin-bottom: $spacing-md;
  }

  .local-setup__title {
    color: $color-text-primary;
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
  }

  .local-setup__desc {
    display: block;
    margin-top: $spacing-xs;
    color: $color-text-secondary;
    font-size: $font-size-sm;
    line-height: 1.6;
  }

  .local-setup__body {
    width: 100%;
  }

  .local-setup__loading {
    padding: $spacing-xl 0;
    text-align: center;
  }

  .local-setup__loading-text {
    color: $color-text-placeholder;
    font-size: $font-size-sm;
  }

  .local-setup__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $spacing-xl 0;
    gap: $spacing-lg;
  }

  .local-setup__empty-text {
    color: $color-text-secondary;
    font-size: $font-size-sm;
    text-align: center;
    line-height: 1.6;
  }

  .local-setup__section {
    margin-bottom: $spacing-md;
  }

  .local-setup__label {
    display: block;
    margin-bottom: $spacing-sm;
    color: $color-text-primary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }

  .local-setup__keys {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  .local-setup__key {
    display: flex;
    align-items: center;
    padding: $spacing-md;
    border: 1rpx solid $color-bg-muted;
    border-radius: $radius-card;
    gap: $spacing-md;
  }

  .local-setup__key--active {
    border-color: rgba(108, 92, 231, 0.45);
    background-color: rgba(108, 92, 231, 0.05);
  }

  .local-setup__key-info {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
  }

  .local-setup__key-name {
    color: $color-text-primary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }

  .local-setup__key-mask {
    margin-top: 4rpx;
    color: $color-text-placeholder;
    font-size: $font-size-xs;
  }

  .local-setup__field {
    padding: 0 $spacing-md;
    border: 1rpx solid $color-bg-muted;
    border-radius: $radius-card;
    background-color: $color-bg-page;
  }

  .local-setup__input {
    width: 100%;
    height: 80rpx;
    color: $color-text-primary;
    font-size: $font-size-sm;
    font-family: monospace;
  }

  .local-setup__placeholder {
    color: $color-text-placeholder;
  }

  .local-setup__help {
    display: block;
    margin-top: $spacing-xs;
    color: $color-text-placeholder;
    font-size: $font-size-xs;
    line-height: 1.5;
  }

  .local-setup__fetch-row {
    margin-bottom: $spacing-sm;
  }

  .local-setup__error {
    display: block;
    margin-bottom: $spacing-sm;
    color: #d63031;
    font-size: $font-size-xs;
    line-height: 1.5;
  }

  .local-setup__footer {
    display: flex;
    padding-top: $spacing-md;
    border-top: 1rpx solid $color-bg-muted;
    gap: $spacing-md;
  }

  .local-setup__btn {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-height: 80rpx;
    border-radius: $radius-button;
  }

  .local-setup__btn--primary {
    background: $color-primary-gradient;
  }

  .local-setup__btn--ghost {
    border: 1rpx solid $color-bg-muted;
    background-color: $color-bg-page;
  }

  .local-setup__btn--disabled {
    opacity: 0.5;
  }

  .local-setup__btn-text {
    color: $color-text-inverse;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }

  .local-setup__btn-text--ghost {
    color: $color-text-primary;
  }
</style>
