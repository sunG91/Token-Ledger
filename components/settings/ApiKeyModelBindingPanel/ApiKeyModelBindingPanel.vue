<template>
  <view class="binding-panel">
    <view v-if="pageLoading" class="binding-panel__loading">
      <text class="binding-panel__loading-text">{{ $t('common.loading') }}</text>
    </view>

    <template v-else-if="!candidateKeys.length">
      <view class="binding-panel__empty">
        <text class="binding-panel__empty-text">{{ $t('dataMode.localNeedApiKey') }}</text>
        <view class="binding-panel__btn binding-panel__btn--primary" @click="onAddKey">
          <text class="binding-panel__btn-text">{{ $t('assistant.addApiKey') }}</text>
        </view>
      </view>
    </template>

    <template v-else>
      <view class="binding-panel__section">
        <text class="binding-panel__label">{{ $t('dataMode.localPickKey') }}</text>
        <view class="binding-panel__keys">
          <view
            v-for="item in candidateKeys"
            :key="item.id"
            class="binding-panel__key"
            :class="{ 'binding-panel__key--active': item.id === selectedKeyId }"
            @click="onSelectKey(item)"
          >
            <api-key-avatar :item="item" :size="40" />
            <view class="binding-panel__key-info">
              <text class="binding-panel__key-name">{{ item.alias || item.maskedKey }}</text>
              <text class="binding-panel__key-mask">{{ item.maskedKey }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="binding-panel__section">
        <text class="binding-panel__label binding-panel__label--required">
          {{ $t('apiKeys.modelsEndpointLabel') }}
        </text>
        <view class="binding-panel__field">
          <input
            class="binding-panel__input"
            type="text"
            :disabled="!modelsEndpointEditable"
            :value="modelsEndpoint"
            maxlength="256"
            :placeholder="$t('apiKeys.modelsEndpointPlaceholder')"
            placeholder-class="binding-panel__placeholder"
            @input="onModelsEndpointInput"
          />
        </view>
        <text class="binding-panel__help">{{ $t('apiKeys.modelsEndpointHelp') }}</text>
      </view>

      <view class="binding-panel__fetch-row">
        <view
          class="binding-panel__btn binding-panel__btn--ghost"
          :class="{ 'binding-panel__btn--disabled': fetching || !canFetch }"
          @click="onFetchModels"
        >
          <text class="binding-panel__btn-text binding-panel__btn-text--ghost">
            {{ fetching ? $t('dataMode.localFetchingModels') : $t('apiKeys.fetchModels') }}
          </text>
        </view>
      </view>

      <text v-if="fetchError" class="binding-panel__error">{{ fetchError }}</text>

      <api-key-remote-model-picker
        :models="remoteModels"
        :value="selectedChatModel"
        :label="$t('settings.chatModelPickLabel')"
        :max-height="280"
        :show-default-option="showDefaultModelOption"
        @change="selectedChatModel = $event"
      />

      <view
        class="binding-panel__btn binding-panel__btn--primary binding-panel__submit"
        :class="{ 'binding-panel__btn--disabled': saving || !canConfirm }"
        @click="onConfirm"
      >
        <text class="binding-panel__btn-text">
          {{ saving ? $t('common.loading') : confirmText }}
        </text>
      </view>
    </template>
  </view>
</template>

<script>
  import ApiKeyAvatar from '@/components/api-keys/ApiKeyAvatar/ApiKeyAvatar.vue';
  import ApiKeyRemoteModelPicker from '@/components/api-keys/ApiKeyRemoteModelPicker/ApiKeyRemoteModelPicker.vue';
  import { fetchModelsForApiKeyRecord, loadLocalModeCandidateKeys } from '@/api/localMode.js';
  import { fetchApiKeySecretById } from '@/utils/apiKeyRepository.js';
  import { isCustomApiKey, isValidHttpUrl } from '@/utils/apiKey.js';
  import {
    DEFAULT_CHAT_MODEL_SENTINEL,
    isDefaultChatModelSentinel,
  } from '@/constants/platformChatModels.js';
  import { isIntegratedPlatformId } from '@/constants/integratedPlatforms.js';
  import { resolveModelsEndpoint } from '@/utils/localModeConfig.js';
  import { formatPlatformApiError } from '@/utils/platformApiErrors.js';

  export default {
    name: 'ApiKeyModelBindingPanel',
    components: {
      ApiKeyAvatar,
      ApiKeyRemoteModelPicker,
    },
    props: {
      confirmText: {
        type: String,
        required: true,
      },
      initialKeyId: {
        type: String,
        default: '',
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
      };
    },
    computed: {
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
    mounted() {
      this.initPanel();
    },
    methods: {
      async initPanel() {
        this.pageLoading = true;
        this.fetchError = '';
        try {
          this.candidateKeys = await loadLocalModeCandidateKeys();
          const initialId = this.initialKeyId || this.candidateKeys[0]?.id || '';
          if (initialId) {
            await this.onSelectKey({ id: initialId }, false);
          }
        } catch (error) {
          this.fetchError = this.$t('dataMode.localValidateFail');
        } finally {
          this.pageLoading = false;
        }
      },
      onAddKey() {
        uni.navigateTo({ url: '/pages/api-keys/add' });
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
      onConfirm() {
        if (this.saving || !this.canConfirm) {
          return;
        }
        this.saving = true;
        this.$emit('confirm', {
          apiKeyId: this.selectedKeyId,
          chatModel: this.selectedChatModel,
          modelsEndpoint: this.modelsEndpointEditable ? this.modelsEndpoint.trim() : '',
        });
      },
      finishSaving() {
        this.saving = false;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .binding-panel__loading {
    padding: $spacing-xl 0;
    text-align: center;
  }

  .binding-panel__loading-text {
    color: $color-text-placeholder;
    font-size: $font-size-sm;
  }

  .binding-panel__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $spacing-xl 0;
    gap: $spacing-lg;
  }

  .binding-panel__empty-text {
    color: $color-text-secondary;
    font-size: $font-size-sm;
    text-align: center;
    line-height: 1.6;
  }

  .binding-panel__section {
    margin-bottom: $spacing-md;
  }

  .binding-panel__label {
    display: block;
    margin-bottom: $spacing-sm;
    color: $color-text-primary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }

  .binding-panel__label--required::after {
    content: ' *';
    color: #d63031;
  }

  .binding-panel__keys {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  .binding-panel__key {
    display: flex;
    align-items: center;
    padding: $spacing-md;
    border: 1rpx solid $color-bg-muted;
    border-radius: $radius-card;
    gap: $spacing-md;
  }

  .binding-panel__key--active {
    border-color: rgba(108, 92, 231, 0.45);
    background-color: rgba(108, 92, 231, 0.05);
  }

  .binding-panel__key-info {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
  }

  .binding-panel__key-name {
    color: $color-text-primary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }

  .binding-panel__key-mask {
    margin-top: 4rpx;
    color: $color-text-placeholder;
    font-size: $font-size-xs;
  }

  .binding-panel__field {
    padding: 0 $spacing-md;
    border: 1rpx solid $color-bg-muted;
    border-radius: $radius-card;
    background-color: $color-bg-page;
  }

  .binding-panel__input {
    width: 100%;
    height: 80rpx;
    color: $color-text-primary;
    font-size: $font-size-sm;
    font-family: monospace;
  }

  .binding-panel__placeholder {
    color: $color-text-placeholder;
  }

  .binding-panel__help {
    display: block;
    margin-top: $spacing-xs;
    color: $color-text-placeholder;
    font-size: $font-size-xs;
    line-height: 1.5;
  }

  .binding-panel__fetch-row {
    margin-bottom: $spacing-sm;
  }

  .binding-panel__error {
    display: block;
    margin-bottom: $spacing-sm;
    color: #d63031;
    font-size: $font-size-xs;
    line-height: 1.5;
  }

  .binding-panel__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 80rpx;
    padding: 0 $spacing-lg;
    border-radius: $radius-button;
  }

  .binding-panel__btn--primary {
    background: $color-primary-gradient;
  }

  .binding-panel__btn--ghost {
    border: 1rpx solid $color-bg-muted;
    background-color: $color-bg-page;
  }

  .binding-panel__btn--disabled {
    opacity: 0.5;
  }

  .binding-panel__submit {
    margin-top: $spacing-lg;
  }

  .binding-panel__btn-text {
    color: $color-text-inverse;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }

  .binding-panel__btn-text--ghost {
    color: $color-text-primary;
  }
</style>
