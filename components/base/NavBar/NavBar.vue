<template>
  <view class="nav-bar" :style="navBarStyle">
    <view class="nav-bar__inner">
      <view class="nav-bar__side">
        <view v-if="showBack" class="nav-bar__btn" @click="onBack">
          <u-icon name="arrow-left" :color="navIconColor" size="20" />
        </view>
      </view>
      <text class="nav-bar__title" :style="{ color: navTitleColor }">{{ title }}</text>
      <view class="nav-bar__side nav-bar__side--right">
        <view v-if="rightText" class="nav-bar__btn" @click="onRightClick">
          <text class="nav-bar__right-text">{{ rightText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { THEME_MODES } from '@/constants/settings.js';
  import { getStatusBarHeight } from '@/utils/system.js';
  import { switchTab } from '@/utils/tab.js';

  export default {
    name: 'NavBar',
    props: {
      title: {
        type: String,
        required: true,
      },
      showBack: {
        type: Boolean,
        default: true,
      },
      rightText: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        statusBarHeight: getStatusBarHeight(),
      };
    },
    computed: {
      ...mapGetters(['resolvedTheme', 'themePalette']),
      isDark() {
        return this.resolvedTheme === THEME_MODES.DARK;
      },
      navBarStyle() {
        return {
          paddingTop: `${this.statusBarHeight}px`,
          backgroundColor: this.themePalette.pageBg,
        };
      },
      navIconColor() {
        return this.isDark ? '#F1F2F6' : '#2D3436';
      },
      navTitleColor() {
        return this.isDark ? '#F1F2F6' : '#2D3436';
      },
    },
    methods: {
      onBack() {
        uni.navigateBack({
          fail: () => {
            switchTab('/pages/profile/index');
          },
        });
      },
      onRightClick() {
        this.$emit('right-click');
      },
    },
  };
</script>

<style lang="scss" scoped>
  .nav-bar {
    flex-shrink: 0;
  }

  .nav-bar__inner {
    display: flex;
    align-items: center;
    height: 88rpx;
    padding: 0 $spacing-sm;
  }

  .nav-bar__side {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: flex-start;
    width: 120rpx;
  }

  .nav-bar__side--right {
    justify-content: flex-end;
  }

  .nav-bar__title {
    flex: 1;
    min-width: 0;
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
    text-align: center;
  }

  .nav-bar__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 72rpx;
    height: 72rpx;
    padding: 0 $spacing-sm;
  }

  .nav-bar__right-text {
    color: $color-secondary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }
</style>
