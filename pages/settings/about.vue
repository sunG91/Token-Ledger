<template>
  <view class="page" :class="appShellClass" :style="appShellStyle">
    <nav-bar :title="$t('about.title')" />
    <view class="page__scroll-wrap">
      <scroll-view class="page__scroll" scroll-y :show-scrollbar="false">
        <view class="page__content">
          <view class="about-hero">
            <image class="about-hero__logo" :src="logoSrc" mode="aspectFit" />
            <text class="about-hero__name">{{ appName }}</text>
            <text class="about-hero__version">{{ $t('about.version') }} {{ appVersion }}</text>
          </view>

          <view class="about-card">
            <text class="about-card__title">{{ $t('about.appIntro') }}</text>
          </view>

          <view class="about-card">
            <text class="about-card__heading">{{ $t('about.productNoticeTitle') }}</text>
            <text class="about-card__paragraph">{{ $t('about.productNotice') }}</text>
            <text class="about-card__paragraph about-card__paragraph--gap">{{
              $t('about.collaborationNote')
            }}</text>
          </view>

          <view class="about-card">
            <text class="about-card__label">{{ $t('about.developer') }}</text>
            <text class="about-card__value">{{ developer }}</text>
            <text class="about-card__label about-card__label--gap">{{ $t('about.contact') }}</text>
            <text class="about-card__link" @click="onCopyEmail">{{ email }}</text>
          </view>

          <view class="about-card">
            <text class="about-card__heading">{{ $t('about.helpTitle') }}</text>
            <view v-for="(item, index) in helpItems" :key="index" class="about-card__item">
              <view class="about-card__dot" />
              <text class="about-card__text">{{ item }}</text>
            </view>
          </view>

          <view class="about-card">
            <text class="about-card__heading">{{ $t('about.legalTitle') }}</text>
            <text class="about-card__paragraph">{{ legalIntro }}</text>
            <view v-for="(item, index) in legalItems" :key="index" class="about-card__item">
              <view class="about-card__dot" />
              <text class="about-card__text">{{ item }}</text>
            </view>
          </view>

          <view class="about-card">
            <text class="about-card__heading">{{ $t('about.privacyTitle') }}</text>
            <text class="about-card__paragraph">{{ privacyContent }}</text>
          </view>

          <view class="about-card">
            <text class="about-card__heading">{{ $t('about.personaAgreementTitle') }}</text>
            <text class="about-card__paragraph">{{ personaAgreementIntro }}</text>
            <view
              v-for="(item, index) in personaAgreementItems"
              :key="`persona-${index}`"
              class="about-card__item"
            >
              <view class="about-card__dot" />
              <text class="about-card__text">{{ item }}</text>
            </view>
          </view>

          <text class="about-footer">{{ copyrightText }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
  import NavBar from '@/components/base/NavBar/NavBar.vue';
  import { APP_INFO, LOCALE_CODES } from '@/constants/settings.js';
  import { resolveStaticAsset } from '@/utils/staticAsset.js';
  import { mapState } from 'vuex';

  export default {
    name: 'SettingsAboutPage',
    components: {
      NavBar,
    },
    data() {
      return {
        developer: APP_INFO.developer,
        email: APP_INFO.email,
        appVersion: APP_INFO.version,
      };
    },
    computed: {
      ...mapState(['locale']),
      appName() {
        return this.locale === LOCALE_CODES.EN ? APP_INFO.nameEn : APP_INFO.name;
      },
      logoSrc() {
        return resolveStaticAsset('/static/logo.png');
      },
      helpItems() {
        return this.$t('about.helpItems');
      },
      legalIntro() {
        return this.$t('about.legalIntro');
      },
      legalItems() {
        return this.$t('about.legalItems');
      },
      privacyContent() {
        return this.$t('about.privacyContent');
      },
      personaAgreementIntro() {
        return this.$t('about.personaAgreementIntro');
      },
      personaAgreementItems() {
        return this.$t('about.personaAgreementItems');
      },
      copyrightText() {
        return this.$t('about.copyright', { year: new Date().getFullYear() });
      },
    },
    methods: {
      onCopyEmail() {
        uni.setClipboardData({
          data: this.email,
          success: () => {
            uni.showToast({ title: this.$t('common.saved'), icon: 'none' });
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

  .about-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: $spacing-md;
    padding: $spacing-xl $spacing-lg;
    border-radius: $radius-card;
    background: $gradient-highlight-card;
    box-shadow: $shadow-card;
  }

  .about-hero__logo {
    width: 128rpx;
    height: 128rpx;
    border-radius: 28rpx;
  }

  .about-hero__name {
    margin-top: $spacing-md;
    color: $color-text-primary;
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
  }

  .about-hero__version {
    margin-top: 8rpx;
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }

  .about-card {
    margin-bottom: $spacing-md;
    padding: $spacing-lg;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
  }

  .about-card__title,
  .about-card__paragraph {
    color: $color-text-secondary;
    font-size: $font-size-sm;
    line-height: 1.7;
  }

  .about-card__paragraph--gap {
    display: block;
    margin-top: $spacing-sm;
  }

  .about-card__heading {
    display: block;
    margin-bottom: $spacing-sm;
    color: $color-text-primary;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
  }

  .about-card__label {
    display: block;
    color: $color-text-secondary;
    font-size: $font-size-xs;
  }

  .about-card__label--gap {
    margin-top: $spacing-md;
  }

  .about-card__value,
  .about-card__link {
    display: block;
    margin-top: 6rpx;
    color: $color-text-primary;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
  }

  .about-card__link {
    color: $color-secondary;
  }

  .about-card__item {
    display: flex;
    align-items: flex-start;
    margin-top: $spacing-sm;
    gap: $spacing-sm;
  }

  .about-card__dot {
    flex-shrink: 0;
    width: 10rpx;
    height: 10rpx;
    margin-top: 12rpx;
    border-radius: $radius-circle;
    background-color: $color-primary;
  }

  .about-card__text {
    flex: 1;
    color: $color-text-secondary;
    font-size: $font-size-sm;
    line-height: 1.7;
  }

  .about-footer {
    display: block;
    margin-top: $spacing-sm;
    color: $color-text-placeholder;
    font-size: $font-size-xs;
    text-align: center;
    line-height: 1.6;
  }
</style>
