<template>
  <view class="settings-group">
    <text v-if="title" class="settings-group__title">{{ title }}</text>
    <view class="settings-group__card">
      <slot />
    </view>
  </view>
</template>

<script>
  export default {
    name: 'SettingsGroup',
    props: {
      title: {
        type: String,
        default: '',
      },
    },
  };
</script>

<style lang="scss" scoped>
  .settings-group {
    margin-bottom: $spacing-md;
  }

  .settings-group__title {
    display: block;
    margin-bottom: $spacing-sm;
    padding: 0 $spacing-xs;
    color: $color-text-secondary;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
  }

  .settings-group__card {
    overflow: hidden;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
  }
</style>
