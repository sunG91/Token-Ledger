<template>
  <view class="settings-option-list">
    <view
      v-for="(item, index) in options"
      :key="item.value"
      class="settings-option-list__item"
      :class="{ 'settings-option-list__item--last': index === options.length - 1 }"
      hover-class="settings-option-list__item--hover"
      @click="onSelect(item.value)"
    >
      <view class="settings-option-list__icon-wrap" :style="{ backgroundColor: item.bgColor }">
        <image
          v-if="item.iconSrc"
          class="settings-option-list__icon-img"
          :src="item.iconSrc"
          mode="aspectFit"
        />
        <u-icon v-else :name="item.icon" :color="item.iconColor" size="18" />
      </view>
      <view class="settings-option-list__body">
        <text class="settings-option-list__title">{{ item.label }}</text>
        <text v-if="item.desc" class="settings-option-list__desc">{{ item.desc }}</text>
      </view>
      <u-icon
        v-if="item.value === value"
        name="checkmark-circle-fill"
        color="#6C5CE7"
        size="20"
      />
    </view>
  </view>
</template>

<script>
  export default {
    name: 'SettingsOptionList',
    props: {
      options: {
        type: Array,
        default: () => [],
      },
      value: {
        type: String,
        required: true,
      },
    },
    methods: {
      onSelect(nextValue) {
        if (nextValue !== this.value) {
          this.$emit('input', nextValue);
          this.$emit('change', nextValue);
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .settings-option-list {
    overflow: hidden;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
  }

  .settings-option-list__item {
    display: flex;
    align-items: center;
    padding: $spacing-md $spacing-lg;
    gap: $spacing-md;

    &:not(.settings-option-list__item--last) {
      border-bottom: 1rpx solid $color-bg-muted;
    }
  }

  .settings-option-list__item--hover {
    opacity: 0.72;
  }

  .settings-option-list__icon-wrap {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 64rpx;
    height: 64rpx;
    border-radius: 18rpx;
  }

  .settings-option-list__icon-img {
    display: block;
    width: 40rpx;
    height: 40rpx;
  }

  .settings-option-list__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4rpx;
  }

  .settings-option-list__title {
    color: $color-text-primary;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
  }

  .settings-option-list__desc {
    color: $color-text-secondary;
    font-size: $font-size-xs;
  }
</style>
