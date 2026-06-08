<template>
  <view v-if="displayModels.length" class="remote-model-picker">
    <text class="remote-model-picker__label">{{ label }}</text>
    <scroll-view class="remote-model-picker__list" scroll-y :style="{ maxHeight: maxHeight + 'px' }">
      <view
        v-for="item in displayModels"
        :key="item.id"
        class="remote-model-picker__item"
        :class="{ 'remote-model-picker__item--active': item.id === value }"
        @click="onSelect(item)"
      >
        <view v-if="item.isDefaultOption" class="remote-model-picker__icon">
          <u-icon name="setting-fill" color="#6C5CE7" :size="18" />
        </view>
        <view class="remote-model-picker__info">
          <text class="remote-model-picker__name">{{ item.label || item.id }}</text>
          <text v-if="item.ownedBy" class="remote-model-picker__meta">{{ item.ownedBy }}</text>
          <text v-else-if="item.description" class="remote-model-picker__meta">
            {{ item.description }}
          </text>
        </view>
        <u-icon v-if="item.id === value" name="checkmark" color="#6C5CE7" size="18" />
      </view>
    </scroll-view>
  </view>
</template>

<script>
  import { DEFAULT_CHAT_MODEL_SENTINEL } from '@/constants/platformChatModels.js';

  export default {
    name: 'ApiKeyRemoteModelPicker',
    props: {
      models: {
        type: Array,
        default: () => [],
      },
      value: {
        type: String,
        default: '',
      },
      label: {
        type: String,
        default: '',
      },
      maxHeight: {
        type: Number,
        default: 280,
      },
      showDefaultOption: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      displayModels() {
        const list = Array.isArray(this.models) ? this.models : [];
        if (!this.showDefaultOption) {
          return list;
        }
        const defaultItem = {
          id: DEFAULT_CHAT_MODEL_SENTINEL,
          label: this.$t('apiKeys.defaultChatModel'),
          description: this.$t('apiKeys.defaultChatModelDesc'),
          isDefaultOption: true,
        };
        return [defaultItem, ...list];
      },
    },
    methods: {
      onSelect(item) {
        this.$emit('input', item.id);
        this.$emit('change', item.id);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .remote-model-picker {
    margin-top: $spacing-md;
  }

  .remote-model-picker__label {
    display: block;
    margin-bottom: $spacing-sm;
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }

  .remote-model-picker__list {
    width: 100%;
    border: 1rpx solid $color-bg-muted;
    border-radius: $radius-card;
    background-color: $color-bg-card;
  }

  .remote-model-picker__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md $spacing-lg;
    border-bottom: 1rpx solid $color-bg-muted;
    gap: $spacing-md;

    &:last-child {
      border-bottom: none;
    }
  }

  .remote-model-picker__item--active {
    background-color: rgba(108, 92, 231, 0.06);
  }

  .remote-model-picker__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40rpx;
    height: 40rpx;
    border-radius: 12rpx;
    background-color: rgba(108, 92, 231, 0.1);
  }

  .remote-model-picker__info {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
  }

  .remote-model-picker__name {
    color: $color-text-primary;
    font-size: $font-size-sm;
    font-family: monospace;
  }

  .remote-model-picker__meta {
    margin-top: 4rpx;
    color: $color-text-placeholder;
    font-size: $font-size-xs;
  }
</style>
