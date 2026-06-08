<template>
  <view class="page-title-bar" :style="barStyle">
    <view class="page-title-bar__inner">
      <text class="page-title-bar__title" :style="{ color: titleColor }">{{ title }}</text>
    </view>
  </view>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { THEME_MODES } from '@/constants/settings.js';
  import { getStatusBarHeight } from '@/utils/system.js';

  export default {
    name: 'PageTitleBar',
    props: {
      title: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        statusBarHeight: getStatusBarHeight(),
      };
    },
    computed: {
      ...mapGetters(['resolvedTheme', 'themePalette']),
      barStyle() {
        return {
          paddingTop: `${this.statusBarHeight}px`,
          backgroundColor: this.themePalette.pageBg,
        };
      },
      titleColor() {
        return this.resolvedTheme === THEME_MODES.DARK ? '#F1F2F6' : '#2D3436';
      },
    },
  };
</script>

<style lang="scss" scoped>
  .page-title-bar {
    flex-shrink: 0;
  }

  .page-title-bar__inner {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88rpx;
    padding: 0 $spacing-lg;
  }

  .page-title-bar__title {
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
  }
</style>
