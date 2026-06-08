<template>
  <view
    class="settings-cell"
    :class="{ 'settings-cell--last': isLast, 'settings-cell--danger': danger }"
    hover-class="settings-cell--hover"
    @tap="onClick"
  >
    <view class="settings-cell__icon-wrap" :style="{ backgroundColor: iconBg }">
      <image
        v-if="iconSrc"
        class="settings-cell__icon-img"
        :src="iconSrc"
        mode="aspectFit"
      />
      <u-icon v-else :name="icon" :color="iconColor" :size="iconSize" />
    </view>
    <view class="settings-cell__body">
      <text class="settings-cell__title">{{ title }}</text>
      <text v-if="subtitle" class="settings-cell__subtitle">{{ subtitle }}</text>
    </view>
    <view class="settings-cell__right">
      <text v-if="value" class="settings-cell__value">{{ value }}</text>
      <u-switch
        v-if="switchable"
        :value="switchValue"
        active-color="#0984E3"
        size="20"
        @click.stop
        @change="onSwitchChange"
      />
      <u-icon v-else-if="arrow" name="arrow-right" color="#B2BEC3" size="14" />
    </view>
  </view>
</template>

<script>
  export default {
    name: 'SettingsCell',
    props: {
      title: {
        type: String,
        required: true,
      },
      subtitle: {
        type: String,
        default: '',
      },
      value: {
        type: String,
        default: '',
      },
      icon: {
        type: String,
        default: 'setting-fill',
      },
      iconSrc: {
        type: String,
        default: '',
      },
      iconColor: {
        type: String,
        default: '#6C5CE7',
      },
      iconBg: {
        type: String,
        default: 'rgba(108, 92, 231, 0.1)',
      },
      iconSize: {
        type: [Number, String],
        default: 18,
      },
      arrow: {
        type: Boolean,
        default: false,
      },
      switchable: {
        type: Boolean,
        default: false,
      },
      switchValue: {
        type: Boolean,
        default: false,
      },
      isLast: {
        type: Boolean,
        default: false,
      },
      danger: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      onClick() {
        if (this.switchable) {
          return;
        }
        this.$emit('click');
      },
      onSwitchChange(value) {
        this.$emit('switch-change', value);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .settings-cell {
    display: flex;
    align-items: center;
    padding: $spacing-md $spacing-lg;
    gap: $spacing-md;

    &:not(.settings-cell--last) {
      border-bottom: 1rpx solid $color-bg-muted;
    }
  }

  .settings-cell--hover {
    opacity: 0.72;
  }

  .settings-cell__icon-wrap {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 64rpx;
    height: 64rpx;
    border-radius: 18rpx;
  }

  .settings-cell__icon-img {
    display: block;
    width: 40rpx;
    height: 40rpx;
  }

  .settings-cell__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    gap: 4rpx;
  }

  .settings-cell__title {
    color: $color-text-primary;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
  }

  .settings-cell--danger .settings-cell__title {
    color: $color-danger;
  }

  .settings-cell__subtitle {
    color: $color-text-secondary;
    font-size: $font-size-xs;
    line-height: 1.5;
  }

  .settings-cell__right {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: $spacing-sm;
  }

  .settings-cell__value {
    color: $color-text-secondary;
    font-size: $font-size-xs;
  }
</style>
