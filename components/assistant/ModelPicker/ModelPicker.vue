<template>
  <u-popup :show="show" mode="bottom" round="16" @close="onClose">
    <view class="model-picker">
      <view class="model-picker__header">
        <text class="model-picker__title">{{ $t('assistant.switchModel') }}</text>
        <text class="model-picker__subtitle">{{ $t('assistant.boundModels') }}</text>
      </view>
      <scroll-view
        v-if="models.length"
        class="model-picker__list"
        scroll-y
        :style="{ maxHeight: listMaxHeight + 'px' }"
      >
        <view
          v-for="item in models"
          :key="item.id"
          class="model-picker__item"
          :class="{ 'model-picker__item--active': item.id === currentId }"
          @click="onSelect(item)"
        >
          <api-key-avatar :item="item.item" :size="72" />
          <view class="model-picker__info">
            <text class="model-picker__name">{{ item.alias }}</text>
            <text class="model-picker__model">{{ formatModelName(item) }}</text>
          </view>
          <u-icon v-if="item.id === currentId" name="checkmark" color="#6C5CE7" size="18" />
        </view>
      </scroll-view>
      <view v-else class="model-picker__empty">
        <text class="model-picker__empty-title">{{ $t('assistant.noBoundModel') }}</text>
        <text class="model-picker__empty-desc">{{ $t('assistant.noBoundModelDesc') }}</text>
        <view class="model-picker__empty-btn" @click="onConfigureChat">
          <text class="model-picker__empty-btn-text">{{ $t('settings.chatModelTitle') }}</text>
        </view>
      </view>
      <view class="model-picker__footer" :style="{ paddingBottom: safeBottom + 'px' }">
        <view class="model-picker__manage" @click="onManage">
          <u-icon name="setting" color="#0984E3" size="16" />
          <text class="model-picker__manage-text">{{ $t('assistant.manageApiKey') }}</text>
        </view>
      </view>
    </view>
  </u-popup>
</template>

<script>
  import { DEFAULT_CHAT_MODEL_SENTINEL } from '@/constants/platformChatModels.js';
  import { getSafeAreaBottom, getWindowHeight } from '@/utils/system.js';

  export default {
    name: 'ModelPicker',
    props: {
      show: {
        type: Boolean,
        default: false,
      },
      models: {
        type: Array,
        default: () => [],
      },
      currentId: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        safeBottom: getSafeAreaBottom(),
        listMaxHeight: Math.floor(getWindowHeight() * 0.45),
      };
    },
    methods: {
      formatModelName(item = {}) {
        if (item.modelName === DEFAULT_CHAT_MODEL_SENTINEL || item.useDefaultIcon) {
          return this.$t('apiKeys.defaultChatModel');
        }
        return item.modelName;
      },
      onClose() {
        this.$emit('close');
      },
      onSelect(item) {
        this.$emit('select', item);
        this.onClose();
      },
      onManage() {
        this.onClose();
        uni.navigateTo({ url: '/pages/api-keys/index' });
      },
      onConfigureChat() {
        this.onClose();
        uni.navigateTo({ url: '/pages/settings/chat-model' });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .model-picker {
    padding: $spacing-lg $spacing-lg 0;
    background-color: $color-bg-card;
  }

  .model-picker__header {
    margin-bottom: $spacing-md;
  }

  .model-picker__title {
    color: $color-text-primary;
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
  }

  .model-picker__subtitle {
    display: block;
    margin-top: 4rpx;
    color: $color-text-placeholder;
    font-size: $font-size-sm;
  }

  .model-picker__list {
    width: 100%;
  }

  .model-picker__item {
    display: flex;
    align-items: center;
    padding: $spacing-md 0;
    border-bottom: 1rpx solid $color-bg-muted;
    gap: $spacing-md;

    &:last-child {
      border-bottom: none;
    }
  }

  .model-picker__item--active {
    background-color: rgba(108, 92, 231, 0.04);
  }

  .model-picker__info {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
  }

  .model-picker__name {
    color: $color-text-primary;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
  }

  .model-picker__model {
    margin-top: 4rpx;
    color: $color-text-placeholder;
    font-size: $font-size-xs;
  }

  .model-picker__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $spacing-xl $spacing-lg;
    text-align: center;
  }

  .model-picker__empty-title {
    color: $color-text-primary;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
  }

  .model-picker__empty-desc {
    margin-top: $spacing-sm;
    color: $color-text-secondary;
    font-size: $font-size-sm;
    line-height: 1.6;
  }

  .model-picker__empty-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 240rpx;
    height: 72rpx;
    margin-top: $spacing-lg;
    padding: 0 $spacing-xl;
    border-radius: $radius-button;
    background: $color-primary-gradient;
  }

  .model-picker__empty-btn-text {
    color: $color-text-inverse;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }

  .model-picker__footer {
    padding-top: $spacing-md;
    border-top: 1rpx solid $color-bg-muted;
  }

  .model-picker__manage {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-md 0;
    gap: $spacing-xs;
  }

  .model-picker__manage-text {
    color: $color-secondary;
    font-size: $font-size-sm;
  }
</style>
