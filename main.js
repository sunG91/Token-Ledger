import App from './App';
import store from './store';
import { createI18nPlugin } from '@/i18n/index.js';
import appPreferencesMixin from '@/mixins/appPreferences.js';
import pageMotionMixin from '@/mixins/pageMotion.js';
import tabPageMixin from '@/mixins/tabPage.js';
import { applyGlobalTheme, resolveThemeMode } from '@/utils/theme.js';

applyGlobalTheme(resolveThemeMode(store.state.themeMode, store.state.systemTheme));

// #ifndef VUE3
import Vue from 'vue';
import uView from 'uview-ui';
import './uni.promisify.adaptor';

Vue.mixin(appPreferencesMixin);
Vue.mixin(pageMotionMixin);
Vue.mixin(tabPageMixin);
Vue.use(
  createI18nPlugin(() => ({
    locale: store.state.locale,
    revision: store.state.preferenceRevision,
  })),
);
Vue.use(uView);
Vue.config.productionTip = false;
App.mpType = 'app';

const app = new Vue({
  store,
  ...App,
});
app.$mount();
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue';
export function createApp() {
  const app = createSSRApp(App);
  return {
    app,
  };
}
// #endif
