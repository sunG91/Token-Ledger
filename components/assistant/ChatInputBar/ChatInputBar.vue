<template>
  <view class="chat-input-bar" :style="barStyle">
    <view class="chat-input-bar__wrap">
      <input
        class="chat-input-bar__input"
        type="text"
        :value="value"
        :disabled="disabled"
        confirm-type="send"
        :adjust-position="true"
        :cursor-spacing="20"
        :placeholder="$t('assistant.inputPlaceholder')"
        placeholder-class="chat-input-bar__placeholder"
        @input="onInput"
        @confirm="onSend"
      />
      <view
        v-if="hasText"
        class="chat-input-bar__send"
        :class="{ 'chat-input-bar__send--disabled': disabled }"
        @click="onSend"
      >
        <u-icon name="arrow-up" color="#FFFFFF" size="18" />
      </view>
      <view v-else-if="showMediaActions" class="chat-input-bar__actions">
        <view
          class="chat-input-bar__voice"
          :class="{ 'chat-input-bar__voice--disabled': disabled }"
          @click="onVoice"
        >
          <u-icon name="mic" color="#FFFFFF" size="18" />
        </view>
        <view class="chat-input-bar__more" @click="onAttach">
          <u-icon name="plus" color="#636E72" size="20" />
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import { getSafeAreaBottom } from '@/utils/system.js';

  export default {
    name: 'ChatInputBar',
    props: {
      value: {
        type: String,
        default: '',
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      extraBottom: {
        type: Number,
        default: 0,
      },
      safeBottom: {
        type: Boolean,
        default: true,
      },
      /** 云端模式才展示语音 / 附件；本地模式仅文字输入 */
      showMediaActions: {
        type: Boolean,
        default: true,
      },
    },
    computed: {
      hasText() {
        return Boolean(this.value && this.value.trim());
      },
      barStyle() {
        const inset = this.safeBottom ? getSafeAreaBottom() : 0;
        return {
          paddingBottom: `${inset + this.extraBottom}px`,
        };
      },
    },
    methods: {
      onInput(e) {
        this.$emit('input', e.detail.value);
      },
      onSend() {
        if (this.disabled || !this.hasText) return;
        this.$emit('send', this.value.trim());
      },
      onVoice() {
        if (this.disabled) return;
        uni.showToast({ title: this.$t('assistant.voiceDev'), icon: 'none' });
      },
      onAttach() {
        this.$emit('attach');
      },
    },
  };
</script>

<style lang="scss" scoped>
  .chat-input-bar {
    flex-shrink: 0;
    padding: $spacing-sm $spacing-lg $spacing-sm;
    background-color: $color-bg-page;
  }

  .chat-input-bar__wrap {
    display: flex;
    align-items: center;
    padding: $spacing-xs $spacing-sm $spacing-xs $spacing-md;
    border-radius: 48rpx;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
    gap: $spacing-sm;
  }

  .chat-input-bar__input {
    flex: 1;
    min-width: 0;
    height: 72rpx;
    color: $color-text-primary;
    font-size: $font-size-base;
  }

  .chat-input-bar__placeholder {
    color: $color-text-placeholder;
    font-size: $font-size-base;
  }

  .chat-input-bar__actions {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: $spacing-xs;
  }

  .chat-input-bar__voice {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64rpx;
    height: 64rpx;
    border-radius: $radius-circle;
    background-color: $color-secondary;
  }

  .chat-input-bar__voice--disabled {
    opacity: 0.5;
  }

  .chat-input-bar__more {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56rpx;
    height: 56rpx;
  }

  .chat-input-bar__send {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 64rpx;
    height: 64rpx;
    border-radius: $radius-circle;
    background: $color-primary-gradient;
    box-shadow: $shadow-button;
  }

  .chat-input-bar__send--disabled {
    opacity: 0.45;
  }
</style>
