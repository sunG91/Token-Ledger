<template>
  <view class="page" :class="appShellClass" :style="appShellStyle">
    <nav-bar :title="$t('settings.languagePageTitle')" />
    <view class="page__content">
      <settings-option-list
        :options="languageOptions"
        :value="locale"
        @change="handleLocaleChange"
      />
    </view>
  </view>
</template>

<script>
  import NavBar from '@/components/base/NavBar/NavBar.vue';
  import SettingsOptionList from '@/components/settings/SettingsOptionList/SettingsOptionList.vue';
  import { LOCALE_CODES } from '@/constants/settings.js';
  import { getSettingsIcon } from '@/constants/settingsIcons.js';
  import settingsLanguagePageMixin from '@/mixins/settingsLanguagePage.js';

  export default {
    name: 'SettingsLanguagePage',
    components: {
      NavBar,
      SettingsOptionList,
    },
    mixins: [settingsLanguagePageMixin],
    computed: {
      languageOptions() {
        void this.$store.state.preferenceRevision;
        return [
          {
            value: LOCALE_CODES.ZH,
            label: this.$t('settings.languageZh'),
            iconSrc: getSettingsIcon('localeZh'),
            bgColor: 'rgba(214, 48, 49, 0.1)',
          },
          {
            value: LOCALE_CODES.EN,
            label: this.$t('settings.languageEn'),
            iconSrc: getSettingsIcon('localeEn'),
            bgColor: 'rgba(9, 132, 227, 0.1)',
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
