import { hideNativeTabBar } from '@/utils/nativeTabBar.js';
import { TAB_LIST, saveLastTabPath } from '@/utils/tab.js';

const TAB_ROUTES = new Set(TAB_LIST.map((item) => item.pagePath.replace(/^\//, '')));

function getCurrentRoute() {
  const pages = getCurrentPages();
  return pages[pages.length - 1]?.route;
}

function isTabRoute(route) {
  return !!route && TAB_ROUTES.has(route);
}

export default {
  onShow() {
    const route = getCurrentRoute();
    if (!isTabRoute(route)) {
      return;
    }
    saveLastTabPath(`/${route}`);
    hideNativeTabBar();
    uni.$emit('app-tab-changed');
    this.syncMpCustomTabBar();
  },
  onReady() {
    const route = getCurrentRoute();
    if (!isTabRoute(route)) {
      return;
    }
    hideNativeTabBar();
    this.$nextTick(() => {
      hideNativeTabBar();
    });
  },
  methods: {
    syncMpCustomTabBar() {
      // #ifdef MP
      if (typeof this.getTabBar !== 'function') {
        return;
      }
      const tabBar = this.getTabBar();
      if (!tabBar) {
        return;
      }
      if (typeof tabBar.refresh === 'function') {
        tabBar.refresh();
        return;
      }
      tabBar.$vm?.refresh?.();
      // #endif
    },
  },
};
