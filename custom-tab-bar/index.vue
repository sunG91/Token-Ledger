<template>
  <view
    class="custom-tabbar-host"
    :class="[themePageClass, { 'custom-tabbar-host--hidden': shouldHide }]"
    :style="[appShellStyle, hostStyle]"
  >
    <app-tab-bar embedded />
  </view>
</template>

<script>
  import AppTabBar from '@/components/AppTabBar/AppTabBar.vue';
  import store from '@/store';
  import { buildThemeCssVars } from '@/utils/themeTokens.js';
  import { getCurrentTabName } from '@/utils/tab.js';
  import { mapGetters, mapState } from 'vuex';

  export default {
    name: 'CustomTabBar',
    store,
    components: {
      AppTabBar,
    },
    data() {
      return {
        tabTick: 0,
      };
    },
    computed: {
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
      this.unsubscribeStore = store.subscribe((mutation) => {
        if (
          mutation.type === 'SET_THEME_MODE' ||
          mutation.type === 'SET_SYSTEM_THEME' ||
          mutation.type === 'BUMP_PREFERENCE_REVISION' ||
          mutation.type === 'SET_LOCALE'
        ) {
          this.refresh();
        }
      });
    },
    beforeDestroy() {
      uni.$off('app-tab-changed', this.refresh);
      this.unsubscribeStore?.();
    },
    methods: {
      refresh() {
        this.tabTick += 1;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .custom-tabbar-host {
    width: 100%;
    transition:
      transform 0.28s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.2s ease;
  }

  .custom-tabbar-host--hidden {
    transform: translateY(100%);
    opacity: 0;
    pointer-events: none;
  }
</style>
