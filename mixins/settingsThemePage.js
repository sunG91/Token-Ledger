import { THEME_MODES } from '@/constants/settings.js';

export default {
  computed: {
    themeMode() {
      return this.$store.state.themeMode;
    },
  },
  methods: {
    handleThemeChange(mode) {
      this.$store.commit('SET_THEME_MODE', mode);
      var toastKey = 'settings.themeSwitchedSystem';
      if (mode === THEME_MODES.LIGHT) {
        toastKey = 'settings.themeSwitchedLight';
      } else if (mode === THEME_MODES.DARK) {
        toastKey = 'settings.themeSwitchedDark';
      }
      uni.showToast({
        title: this.$t(toastKey),
        icon: 'none',
      });
    },
  },
};
