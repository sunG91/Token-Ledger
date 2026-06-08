import { mapGetters, mapState } from 'vuex';
import { LOCALE_CODES } from '@/constants/settings.js';
import { buildThemeCssVars } from '@/utils/themeTokens.js';

export default {
  computed: {
    ...mapGetters(['themePageClass', 'resolvedTheme', 'themePalette']),
    ...mapState(['locale', 'preferenceRevision', 'themeMode', 'systemTheme']),
    appShellClass() {
      void this.preferenceRevision;
      void this.themeMode;
      void this.systemTheme;
      void this.resolvedTheme;
      const localeSuffix = this.locale === LOCALE_CODES.EN ? 'en' : 'zh';
      const classes = [this.themePageClass, `app-locale-${localeSuffix}`];
      if (this.pageShellEntered) {
        classes.push('page-shell-enter');
      }
      return classes;
    },
    appShellStyle() {
      void this.preferenceRevision;
      void this.themeMode;
      void this.systemTheme;
      return buildThemeCssVars(this.resolvedTheme, this.themePalette);
    },
    refresherBackground() {
      void this.preferenceRevision;
      void this.systemTheme;
      return this.themePalette.pageBg;
    },
  },
};
