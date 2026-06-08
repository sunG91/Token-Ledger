import { applyPageBackground } from '@/utils/theme.js';

export default {
  data() {
    return {
      pageShellEntered: false,
    };
  },
  onReady() {
    this.syncPageBackground();
    this.markPageEntered();
  },
  onShow() {
    this.syncPageBackground();
    if (!this.pageShellEntered) {
      this.markPageEntered();
    }
  },
  methods: {
    syncPageBackground() {
      if (!this.$store) return;
      applyPageBackground(this.$store.state.themeMode);
    },
    markPageEntered() {
      this.$nextTick(() => {
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => {
            this.pageShellEntered = true;
          });
          return;
        }
        setTimeout(() => {
          this.pageShellEntered = true;
        }, 16);
      });
    },
  },
};
