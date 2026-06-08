<template>
  <view class="home-header" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="home-header__bar">
      <text class="home-header__title">{{ $t('app.name') }}</text>
      <view class="home-header__actions">
        <data-mode-switch :value="dataMode" @change="onDataModeChange" />
        <view class="home-header__btn" @click="onNotify">
          <u-icon name="bell" color="#2D3436" size="22" />
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import DataModeSwitch from '@/components/home/DataModeSwitch/DataModeSwitch.vue';
  import { DATA_MODES } from '@/constants/appMode.js';
  import { getDataModeLabel } from '@/utils/appMode.js';
  import { getStatusBarHeight } from '@/utils/system.js';

  export default {
    name: 'HomeHeader',
    components: {
      DataModeSwitch,
    },
    data() {
      return {
        statusBarHeight: getStatusBarHeight(),
      };
    },
    computed: {
      dataMode() {
        return this.$store.state.dataMode;
      },
    },
    methods: {
      onDataModeChange(mode) {
        if (mode === DATA_MODES.CLOUD) {
          this.commitDataMode(mode);
          return;
        }
        uni.navigateTo({ url: '/pages/settings/local-mode?from=switch' });
      },
      commitDataMode(mode) {
        this.$store.commit('SET_DATA_MODE', mode);
        uni.showToast({
          title: this.$t('dataMode.switched', { mode: getDataModeLabel(mode) }),
          icon: 'none',
        });
      },
      onNotify() {
        uni.showToast({
          title: this.$t('home.noNotifications'),
          icon: 'none',
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .home-header {
    background-color: $color-bg-page;
  }

  .home-header__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    padding: 0 $spacing-lg;
    gap: $spacing-md;
  }

  .home-header__title {
    flex: 1;
    min-width: 0;
    color: $color-text-primary;
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
  }

  .home-header__actions {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: $spacing-sm;
  }

  .home-header__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72rpx;
    height: 72rpx;
  }
</style>
