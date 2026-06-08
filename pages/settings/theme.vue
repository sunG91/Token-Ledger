<template>
  <view class="page" :class="appShellClass" :style="appShellStyle">
    <nav-bar :title="$t('settings.themePageTitle')" />
    <view class="page__content">
      <settings-option-list
        :options="themeOptions"
        :value="themeMode"
        @change="handleThemeChange"
      />
    </view>
  </view>
</template>

<script>
  import NavBar from '@/components/base/NavBar/NavBar.vue';
  import SettingsOptionList from '@/components/settings/SettingsOptionList/SettingsOptionList.vue';
  import { THEME_MODES } from '@/constants/settings.js';
  import settingsThemePageMixin from '@/mixins/settingsThemePage.js';

  export default {
    name: 'SettingsThemePage',
    components: {
      NavBar,
      SettingsOptionList,
    },
    mixins: [settingsThemePageMixin],
    computed: {
      themeOptions() {
        void this.$store.state.preferenceRevision;
        return [
          {
            value: THEME_MODES.SYSTEM,
            label: this.$t('settings.themeSystem'),
            icon: 'setting-fill',
            iconColor: '#636E72',
            bgColor: 'rgba(99, 110, 114, 0.1)',
          },
          {
            value: THEME_MODES.LIGHT,
            label: this.$t('settings.themeLight'),
            icon: 'eye-fill',
            iconColor: '#FDCB6E',
            bgColor: 'rgba(253, 203, 110, 0.15)',
          },
          {
            value: THEME_MODES.DARK,
            label: this.$t('settings.themeDark'),
            icon: 'eye-off-outline',
            iconColor: '#6C5CE7',
            bgColor: 'rgba(108, 92, 231, 0.12)',
          },
        ];
      },
    },
  };
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100%;
  }

  .page__content {
    padding: $spacing-md $spacing-lg;
  }
</style>
