<template>
  <!-- #ifndef MP -->
  <view
    v-show="!shouldHide"
    class="page-tabbar-wrap"
    :class="themePageClass"
    :style="[appShellStyle, hostStyle]"
  >
    <app-tab-bar :embedded="useEmbeddedTabBar" />
  </view>
  <!-- #endif -->
</template>

<script>
  import AppTabBar from '@/components/AppTabBar/AppTabBar.vue';
  import { buildThemeCssVars } from '@/utils/themeTokens.js';
  import { getCurrentTabName } from '@/utils/tab.js';
  import { mapGetters, mapState } from 'vuex';

  export default {
    name: 'PageTabBar',
    components: {
      AppTabBar,
    },
    data() {
      return {
        tabTick: 0,
      };
    },
    computed: {
      useEmbeddedTabBar() {
        // #ifdef H5 || APP-PLUS
        return false;
        // #endif
        return true;
      },
      ...mapGetters(['themePageClass', 'themePalette', 'resolvedTheme']),
      ...mapState(['tabBarVisible', 'preferenceRevision', 'themeMode', 'systemTheme']),
      appShellStyle() {
        void this.preferenceRevision;
        void this.themeMode;
        void this.systemTheme;
        void this.tabTick;
        return buildThemeCssVars(this.resolvedTheme, this.themePalette);
      },
      shouldHide() {
        void this.tabTick;
        void this.tabBarVisible;
        return getCurrentTabName() === 'records' && !this.tabBarVisible;
      },
      hostStyle() {
        void this.preferenceRevision;
        void this.themeMode;
        void this.systemTheme;
        return {
          backgroundColor: this.themePalette.tabBg,
        };
      },
    },
    created() {
      uni.$on('app-tab-changed', this.refresh);
    },
    beforeDestroy() {
      uni.$off('app-tab-changed', this.refresh);
    },
    methods: {
      refresh() {
        this.tabTick += 1;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .page-tabbar-wrap {
    flex-shrink: 0;
    width: 100%;
  }
</style>
