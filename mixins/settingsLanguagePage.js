export default {
  computed: {
    locale() {
      return this.$store.state.locale;
    },
  },
  methods: {
    handleLocaleChange(locale) {
      this.$store.commit('SET_LOCALE', locale);
      uni.showToast({
        title: this.$t('common.switched'),
        icon: 'none',
      });
    },
  },
};
