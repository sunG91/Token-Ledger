<template>
  <view class="profile-menu-list">
    <view
      v-for="item in items"
      :key="item.id"
      class="profile-menu-list__item"
      @click="onItemClick(item)"
    >
      <view class="profile-menu-list__icon-wrap">
        <image class="profile-menu-list__icon" :src="item.iconSrc" mode="aspectFit" />
      </view>
      <view class="profile-menu-list__body">
        <text class="profile-menu-list__title">{{ item.title }}</text>
        <text class="profile-menu-list__subtitle">{{ item.subtitle }}</text>
      </view>
      <u-icon name="arrow-right" color="#B2BEC3" size="14" />
    </view>
  </view>
</template>

<script>
  import { getProfileIcon } from '@/constants/profileIcons.js';

  export default {
    name: 'ProfileMenuList',
    props: {
      profile: {
        type: Object,
        default: () => ({}),
      },
    },
    computed: {
      items() {
        void this.$store.state.preferenceRevision;
        const syncSubtitle = this.profile.syncEnabled
          ? this.$t('profile.syncOn')
          : this.$t('profile.syncOff');
        const backupSubtitle = this.profile.lastBackupLabel
          ? this.$t('profile.lastBackup', { label: this.profile.lastBackupLabel })
          : this.$t('profile.noBackup');

        return [
          {
            id: 'backup',
            iconSrc: getProfileIcon('dataBackup'),
            title: this.$t('profile.menuBackup'),
            subtitle: backupSubtitle,
          },
          {
            id: 'sync',
            iconSrc: getProfileIcon('cloudSync'),
            title: this.$t('profile.menuSync'),
            subtitle: syncSubtitle,
          },
          {
            id: 'member',
            iconSrc: getProfileIcon('memberBenefits'),
            title: this.$t('profile.menuMember'),
            subtitle: this.$t('profile.menuMemberSub'),
          },
          {
            id: 'apiKey',
            iconSrc: getProfileIcon('apiKey'),
            title: this.$t('profile.menuApiKey'),
            subtitle: this.$t('profile.menuApiKeySub'),
          },
          {
            id: 'settings',
            iconSrc: getProfileIcon('settings'),
            title: this.$t('profile.menuSettings'),
            subtitle: this.$t('profile.menuSettingsSub'),
          },
        ];
      },
    },
    methods: {
      onItemClick(item) {
        this.$emit('item-click', item);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .profile-menu-list {
    margin-top: $spacing-md;
    padding: 8rpx $spacing-lg;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
  }

  .profile-menu-list__item {
    display: flex;
    align-items: center;
    padding: $spacing-md 0;
    gap: $spacing-md;

    &:not(:last-child) {
      border-bottom: 1rpx solid $color-bg-muted;
    }
  }

  .profile-menu-list__icon-wrap {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 72rpx;
    height: 72rpx;
    border-radius: 20rpx;
    background-color: $color-bg-muted;
  }

  .profile-menu-list__icon {
    display: block;
    width: 48rpx;
    height: 48rpx;
  }

  .profile-menu-list__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    gap: 4rpx;
  }

  .profile-menu-list__title {
    color: $color-text-primary;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
  }

  .profile-menu-list__subtitle {
    color: $color-text-secondary;
    font-size: $font-size-xs;
  }
</style>
