<template>
  <view class="data-mode-switch" :class="{ 'data-mode-switch--disabled': disabled }" @click="onToggle">
    <u-icon :name="iconName" :color="iconColor" size="22" />
  </view>
</template>

<script>
  import { DATA_MODES } from '@/constants/appMode.js';

  export default {
    name: 'DataModeSwitch',
    props: {
      value: {
        type: String,
        required: true,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      isCloudMode() {
        return this.value === DATA_MODES.CLOUD;
      },
      iconName() {
        return this.isCloudMode ? 'wifi' : 'wifi-off';
      },
      iconColor() {
        return this.isCloudMode ? '#6C5CE7' : '#636E72';
      },
    },
    methods: {
      onToggle() {
        if (this.disabled) {
          return;
        }
        const nextMode = this.isCloudMode ? DATA_MODES.LOCAL : DATA_MODES.CLOUD;
        this.$emit('input', nextMode);
        this.$emit('change', nextMode);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .data-mode-switch {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72rpx;
    height: 72rpx;
    border-radius: $radius-circle;
    background-color: rgba(108, 92, 231, 0.06);
  }

  .data-mode-switch--disabled {
    opacity: 0.5;
  }
</style>
