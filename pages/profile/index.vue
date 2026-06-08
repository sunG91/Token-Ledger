<template>
  <view class="page" :class="appShellClass" :style="appShellStyle">
    <page-title-bar :title="$t('profile.title')" />
    <view class="page__scroll-wrap">
      <scroll-view class="page__scroll" scroll-y :show-scrollbar="false">
        <view class="page__content">
          <view v-if="pageLoading" class="page__loading">
            <list-skeleton :count="4" />
          </view>
          <template v-else>
            <profile-user-card :profile="profile" />
            <pro-member-banner @renew="onProRenew" />
            <profile-menu-list :profile="profile" @item-click="onMenuClick" />
            <profile-savings-card
              :saved-tokens="profile.monthlySavedTokens"
              :planned-tokens="profile.monthlyPlannedTokens"
              :consumed-tokens="profile.monthlyConsumedTokens"
              :remark="profile.savingsRemark"
            />
          </template>
        </view>
      </scroll-view>
    </view>
    <page-tab-bar />
  </view>
</template>

<script>
  import PageTitleBar from '@/components/base/PageTitleBar/PageTitleBar.vue';
  import ListSkeleton from '@/components/base/ListSkeleton/ListSkeleton.vue';
  import ProMemberBanner from '@/components/profile/ProMemberBanner/ProMemberBanner.vue';
  import ProfileMenuList from '@/components/profile/ProfileMenuList/ProfileMenuList.vue';
  import ProfileSavingsCard from '@/components/profile/ProfileSavingsCard/ProfileSavingsCard.vue';
  import ProfileUserCard from '@/components/profile/ProfileUserCard/ProfileUserCard.vue';
  import { fetchProfile } from '@/api/profile.js';
  import { MONTHLY_OVERVIEW_CHANGED } from '@/utils/monthlyOverviewEvents.js';

  export default {
    name: 'ProfilePage',
    components: {
      PageTitleBar,
      ListSkeleton,
      ProfileUserCard,
      ProMemberBanner,
      ProfileMenuList,
      ProfileSavingsCard,
    },
    data() {
      return {
        pageLoading: true,
        profile: {
          avatarEmoji: '📒',
          nickname: '小记账本',
          userId: 'token_2024',
          isPro: true,
          lastBackupLabel: '',
          syncEnabled: true,
          monthlySaved: 0,
        },
      };
    },
    onShow() {
      this.loadProfile();
    },
    mounted() {
      uni.$on(MONTHLY_OVERVIEW_CHANGED, this.loadProfile);
    },
    beforeDestroy() {
      uni.$off(MONTHLY_OVERVIEW_CHANGED, this.loadProfile);
    },
    methods: {
      async loadProfile() {
        this.pageLoading = true;
        try {
          this.profile = await fetchProfile();
        } finally {
          this.pageLoading = false;
        }
      },
      onProRenew() {
        uni.showToast({
          title: this.$t('profile.renewDev'),
          icon: 'none',
        });
      },
      onMenuClick(item) {
        if (item.id === 'apiKey') {
          uni.navigateTo({ url: '/pages/api-keys/index' });
          return;
        }

        if (item.id === 'settings') {
          uni.navigateTo({ url: '/pages/settings/index' });
          return;
        }

        uni.showToast({
          title: this.$t('profile.featureDev', { feature: item.title }),
          icon: 'none',
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .page {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 100vh;
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

  .page__loading {
    padding-top: $spacing-sm;
  }
</style>
