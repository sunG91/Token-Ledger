<template>
  <view class="page" :class="appShellClass" :style="appShellStyle">
    <nav-bar :title="$t('settings.title')" />
    <view class="page__scroll-wrap">
      <scroll-view class="page__scroll" scroll-y :show-scrollbar="false">
        <view class="page__content">
          <settings-group :title="$t('settings.general')">
            <settings-cell
              :title="$t('settings.localModeTitle')"
              :subtitle="$t('settings.localModeDesc')"
              :value="dataModeLabel"
              icon="wifi-off"
              icon-color="#636E72"
              icon-bg="rgba(99, 110, 114, 0.1)"
              arrow
              @click="goLocalMode"
            />
            <settings-cell
              :title="$t('settings.chatModelTitle')"
              :subtitle="$t('settings.chatModelMenuDesc')"
              :value="chatModelSummary"
              icon="chat-fill"
              icon-color="#6C5CE7"
              icon-bg="rgba(108, 92, 231, 0.1)"
              arrow
              @click="goChatModel"
            />
            <settings-cell
              :title="$t('settings.personaTitle')"
              :subtitle="$t('settings.personaDesc')"
              :value="personaSummary"
              icon="heart-fill"
              icon-color="#FD79A8"
              icon-bg="rgba(253, 121, 168, 0.12)"
              arrow
              @click="goPersona"
            />
            <settings-cell
              :title="$t('settings.recordExpand')"
              :subtitle="$t('settings.recordExpandDesc')"
              icon="grid-fill"
              icon-color="#0984E3"
              icon-bg="rgba(9, 132, 227, 0.1)"
              switchable
              :switch-value="recordExpandEnabled"
              is-last
              @switch-change="onRecordExpandChange"
            />
          </settings-group>

          <settings-group :title="$t('settings.appearance')">
            <settings-cell
              :title="$t('settings.theme')"
              :subtitle="$t('settings.themeDesc')"
              :value="themeLabel"
              icon="photo-fill"
              icon-color="#6C5CE7"
              icon-bg="rgba(108, 92, 231, 0.1)"
              arrow
              @click="goTheme"
            />
            <settings-cell
              :title="$t('settings.language')"
              :subtitle="$t('settings.languageDesc')"
              :value="languageLabel"
              :icon-src="languageIconSrc"
              icon-bg="rgba(0, 184, 148, 0.1)"
              arrow
              is-last
              @click="goLanguage"
            />
          </settings-group>

          <settings-group :title="$t('settings.other')">
            <settings-cell
              :title="$t('settings.dataClearTitle')"
              :subtitle="$t('settings.dataClearDesc')"
              icon="trash-fill"
              icon-color="#D63031"
              icon-bg="rgba(214, 48, 49, 0.1)"
              arrow
              @click="goDataClear"
            />
            <settings-cell
              :title="$t('settings.about')"
              :subtitle="$t('settings.aboutDesc')"
              icon="info-circle-fill"
              icon-color="#74B9FF"
              icon-bg="rgba(116, 185, 255, 0.15)"
              arrow
              is-last
              @click="goAbout"
            />
          </settings-group>

          <settings-group>
            <settings-cell
              :title="$t('settings.logout')"
              :subtitle="$t('settings.logoutDesc')"
              icon="man-delete-fill"
              icon-color="#D63031"
              icon-bg="rgba(214, 48, 49, 0.1)"
              danger
              is-last
              @click="onLogout"
            />
          </settings-group>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import NavBar from '@/components/base/NavBar/NavBar.vue';
  import SettingsCell from '@/components/settings/SettingsCell/SettingsCell.vue';
  import SettingsGroup from '@/components/settings/SettingsGroup/SettingsGroup.vue';
  import { LOCALE_CODES, THEME_MODES } from '@/constants/settings.js';
  import { getSettingsIcon } from '@/constants/settingsIcons.js';
  import { fetchApiKeys } from '@/api/apiKeys.js';
  import { DATA_MODES } from '@/constants/appMode.js';
  import { getDataModeLabel } from '@/utils/appMode.js';
  import { clearAuth } from '@/utils/auth.js';
  import { getLocalModeConfig } from '@/utils/localModeConfig.js';

  export default {
    name: 'SettingsPage',
    components: {
      NavBar,
      SettingsGroup,
      SettingsCell,
    },
    data() {
      return {
        chatModelSummary: '',
      };
    },
    computed: {
      ...mapState(['recordExpandEnabled', 'themeMode', 'locale', 'dataMode']),
      ...mapGetters(['resolvedPersonaConfig']),
      personaSummary() {
        void this.$store.state.preferenceRevision;
        const config = this.resolvedPersonaConfig;
        if (!config.enabled) {
          return this.$t('settings.personaOff');
        }
        const name = this.$t(`settings.personaSkill.${config.personaId}.name`);
        return this.$t('settings.personaOnSummary', { name });
      },
      dataModeLabel() {
        return getDataModeLabel(this.dataMode);
      },
      themeLabel() {
        if (this.themeMode === THEME_MODES.LIGHT) {
          return this.$t('settings.themeLight');
        }
        if (this.themeMode === THEME_MODES.DARK) {
          return this.$t('settings.themeDark');
        }
        return this.$t('settings.themeSystem');
      },
      languageLabel() {
        return this.locale === LOCALE_CODES.EN
          ? this.$t('settings.languageEn')
          : this.$t('settings.languageZh');
      },
      languageIconSrc() {
        return getSettingsIcon('language');
      },
    },
    onShow() {
      this.$store.commit('ENSURE_PERSONA_CONFIG');
      this.loadChatModelSummary();
    },
    methods: {
      async loadChatModelSummary() {
        try {
          const keys = await fetchApiKeys();
          const bound = keys.filter((item) => item.enabled !== false && item.chatModel);
          if (!bound.length) {
            this.chatModelSummary = this.$t('settings.chatModelUnset');
            return;
          }
          if (this.dataMode === DATA_MODES.LOCAL) {
            const { apiKeyId } = getLocalModeConfig();
            const key = bound.find((item) => item.id === apiKeyId) || bound[0];
            this.chatModelSummary = `${key.alias || key.maskedKey} · ${key.chatModel}`;
            return;
          }
          this.chatModelSummary = this.$t('settings.chatModelCount', { count: bound.length });
        } catch (error) {
          this.chatModelSummary = this.$t('settings.chatModelUnset');
        }
      },
      goLocalMode() {
        uni.navigateTo({ url: '/pages/settings/local-mode' });
      },
      goChatModel() {
        uni.navigateTo({ url: '/pages/settings/chat-model' });
      },
      goPersona() {
        this.$store.commit('ENSURE_PERSONA_CONFIG');
        uni.navigateTo({
          url: '/pages/settings/persona',
          fail: () => {
            uni.showToast({
              title: this.$t('settings.personaOpenFailed'),
              icon: 'none',
            });
          },
        });
      },
      onRecordExpandChange(enabled) {
        this.$store.commit('SET_RECORD_EXPAND_ENABLED', enabled);
        uni.showToast({
          title: enabled ? this.$t('settings.recordExpandOn') : this.$t('settings.recordExpandOff'),
          icon: 'none',
        });
      },
      goTheme() {
        uni.navigateTo({ url: '/pages/settings/theme' });
      },
      goLanguage() {
        uni.navigateTo({ url: '/pages/settings/language' });
      },
      goDataClear() {
        uni.navigateTo({ url: '/pages/settings/data-clear' });
      },
      goAbout() {
        uni.navigateTo({ url: '/pages/settings/about' });
      },
      onLogout() {
        uni.showModal({
          title: this.$t('settings.logoutConfirmTitle'),
          content: this.$t('settings.logoutConfirmContent'),
          confirmText: this.$t('common.confirm'),
          cancelText: this.$t('common.cancel'),
          success: (res) => {
            if (!res.confirm) {
              return;
            }
            clearAuth();
            this.$store.commit('SET_USER_INFO', null);
            uni.showToast({
              title: this.$t('settings.loggedOut'),
              icon: 'none',
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 500);
          },
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background-color: $color-bg-page;
  }

  .page__scroll-wrap {
    flex: 1;
    min-height: 0;
    width: 100%;
  }

  .page__scroll {
    width: 100%;
    height: 100%;
  }

  .page__content {
    box-sizing: border-box;
    width: 100%;
    max-width: 750rpx;
    margin: 0 auto;
    padding: $spacing-md $spacing-lg calc(#{$spacing-xl} + #{$spacing-lg});
  }
</style>
