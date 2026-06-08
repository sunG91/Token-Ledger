<script>
  import { initAppPreferences } from '@/utils/appPreferences.js';
  import { ensureDefaultUser } from '@/utils/auth.js';
  import { restoreLastTab } from '@/utils/tab.js';

  export default {
    onLaunch() {
      ensureDefaultUser();
      // #ifdef APP-PLUS
      try {
        if (typeof plus !== 'undefined' && plus.nativeUI?.setUIStyle) {
          plus.nativeUI.setUIStyle('auto');
        }
      } catch (error) {
        // ignore
      }
      // #endif
      initAppPreferences(this.$store);
      this.$store.commit('ENSURE_PERSONA_CONFIG');
      restoreLastTab();
    },
    onShow() {
      this.$store.dispatch('refreshSystemTheme');
    },
    onThemeChange() {
      this.$store.dispatch('refreshSystemTheme');
    },
  };
</script>

<style lang="scss">
  @import 'uview-ui/index.scss';
  @import '@/styles/theme-page.scss';
  @import '@/styles/theme-global.scss';
  @import '@/styles/motion.scss';

  page {
    height: 100%;
    background-color: $color-bg-page !important;
    color: $color-text-primary;
    font-size: $font-size-base;
  }

  uni-page-body,
  body {
    background-color: $color-bg-page !important;
  }

  /* H5 / App：隐藏原生 tabBar，避免与 PageTabBar 重复叠层 */
  /* #ifdef H5 || APP-PLUS */
  uni-tabbar,
  .uni-tabbar,
  .uni-tabbar-bottom,
  .uni-tabbar__bd,
  .uni-tabbar__icon,
  .uni-tabbar__label {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    max-height: 0 !important;
    overflow: hidden !important;
    pointer-events: none !important;
  }

  .uni-app--showtabbar uni-page-wrapper,
  .uni-app--showtabbar .uni-page-wrapper {
    padding-bottom: 0 !important;
  }
  /* #endif */
</style>
