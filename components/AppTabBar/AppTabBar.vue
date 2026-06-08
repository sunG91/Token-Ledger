<template>
  <view class="app-tabbar" :class="[themePageClass, { 'app-tabbar--embedded': embedded }]">
    <u-tabbar
      :value="current"
      :fixed="!embedded"
      :placeholder="!embedded"
      :safe-area-inset-bottom="true"
      :active-color="tabPalette.tabActive"
      :inactive-color="tabPalette.tabInactive"
      :border="true"
      :custom-style="tabbarStyle"
      @change="onTabChange"
    >
      <u-tabbar-item
        v-for="item in localizedTabList"
        :key="item.name"
        :name="item.name"
        :text="item.text"
        :icon="item.icon"
      />
    </u-tabbar>
  </view>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import { TAB_LIST, getCurrentTabName, switchTab } from '@/utils/tab.js';

  export default {
    name: 'AppTabBar',
    props: {
      embedded: {
        type: Boolean,
        default: true,
      },
    },
    data() {
      return {
        tabTick: 0,
      };
    },
    created() {
      uni.$on('app-tab-changed', this.bumpTabTick);
    },
    beforeDestroy() {
      uni.$off('app-tab-changed', this.bumpTabTick);
    },
    computed: {
      ...mapGetters(['themePageClass', 'themePalette']),
      ...mapState(['preferenceRevision', 'themeMode', 'systemTheme']),
      current() {
        void this.tabTick;
        return getCurrentTabName();
      },
      tabPalette() {
        void this.preferenceRevision;
        void this.themeMode;
        void this.systemTheme;
        return this.themePalette;
      },
      tabbarStyle() {
        void this.preferenceRevision;
        void this.themeMode;
        void this.systemTheme;
        return {
          backgroundColor: this.themePalette.tabBg,
          borderTop: `1px solid ${this.themePalette.tabBorder}`,
        };
      },
      localizedTabList() {
        void this.preferenceRevision;
        return TAB_LIST.map((item) => ({
          ...item,
          text: this.$t(`tabBar.${item.name}`),
        }));
      },
    },
    methods: {
      bumpTabTick() {
        this.tabTick += 1;
      },
      onTabChange(name) {
        const target = TAB_LIST.find((item) => item.name === name);
        if (!target || target.name === this.current) return;
        switchTab(target.pagePath);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .app-tabbar {
    flex-shrink: 0;
    width: 100%;
  }

  .app-tabbar--embedded {
    ::v-deep .u-tabbar {
      flex: none;
      width: 100%;
    }

    ::v-deep .u-tabbar__content {
      width: 100%;
    }

    ::v-deep .u-tabbar__content__item-wrapper {
      height: 50px;
      min-height: 50px;
    }

    ::v-deep .u-tabbar-item {
      flex: 1;
      min-width: 0;
    }

    ::v-deep .u-tabbar-item__icon {
      width: auto;
      height: auto;
      align-items: center;
      justify-content: center;
    }

    ::v-deep .u-tabbar-item__text {
      font-size: 12px;
      line-height: 1.2;
    }
  }
</style>
