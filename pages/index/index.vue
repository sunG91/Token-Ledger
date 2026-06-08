<template>
  <view class="page" :class="appShellClass" :style="appShellStyle">
    <view class="page__body">
      <home-header class="page__header" />
      <summary-cards :summary="summary" />
      <recent-list ref="recentList" class="page__list" />
      <home-actions class="page__actions" />
    </view>
    <page-tab-bar />
  </view>
</template>

<script>
  import HomeHeader from '@/components/home/HomeHeader/HomeHeader.vue';
  import SummaryCards from '@/components/home/SummaryCards/SummaryCards.vue';
  import RecentList from '@/components/home/RecentList/RecentList.vue';
  import HomeActions from '@/components/home/HomeActions/HomeActions.vue';
  import { fetchHomeSummary } from '@/api/home.js';
  import { MONTHLY_OVERVIEW_CHANGED } from '@/utils/monthlyOverviewEvents.js';

  const EMPTY_SUMMARY = {
    consumedTokens: 0,
    consumedHint: '',
    quotaTokens: 0,
    totalPlannedTokens: 0,
    sharedPlannedTokens: 0,
    quotaHint: '',
    otherTokenPercent: 0,
  };

  export default {
    name: 'HomePage',
    components: {
      HomeHeader,
      SummaryCards,
      RecentList,
      HomeActions,
    },
    data() {
      return {
        summary: { ...EMPTY_SUMMARY },
      };
    },
    onShow() {
      this.refreshHomeData();
    },
    mounted() {
      uni.$on(MONTHLY_OVERVIEW_CHANGED, this.refreshHomeData);
    },
    beforeDestroy() {
      uni.$off(MONTHLY_OVERVIEW_CHANGED, this.refreshHomeData);
    },
    methods: {
      refreshHomeData() {
        this.loadSummary();
        this.$nextTick(() => {
          this.$refs.recentList?.paginatedRefresh?.();
        });
      },
      async loadSummary() {
        try {
          this.summary = await fetchHomeSummary();
        } catch (error) {
          this.summary = { ...EMPTY_SUMMARY };
        }
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
  }

  .page__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  .page__header {
    flex-shrink: 0;
  }

  .page__list {
    flex: 1;
    min-height: 0;
    margin-top: $spacing-lg;
    padding: 0 $spacing-lg;
  }

  .page__actions {
    flex-shrink: 0;
  }
</style>
