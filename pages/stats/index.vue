<template>
  <view class="page" :class="appShellClass" :style="appShellStyle">
    <page-title-bar :title="$t('stats.title')" />
    <stats-tab-bar v-model="activeTab" @change="onTabChange" />
    <view class="page__scroll-wrap">
      <scroll-view class="page__scroll" scroll-y :show-scrollbar="false">
        <view class="page__content">
          <view v-if="pageLoading" class="page__loading">
            <list-skeleton :count="5" />
          </view>
          <view v-else :key="activeTab" class="page__tab-panel">
            <template v-if="activeTab === 'overview'">
              <stats-overview-card :overview="overview" />
              <stats-trend-chart
                class="page__section"
                :points="trendPoints"
                :title="$t('stats.consumeTrend')"
              />
              <stats-ranking-list class="page__section" :items="ranking" />
            </template>

            <stats-trend-panel
              v-else-if="activeTab === 'trend'"
              :points="trendPoints"
              :granularity="trendGranularity"
              :anchor-date="trendAnchorDate"
              :date-label="trendDateLabel"
              @granularity-change="onGranularityChange"
              @date-change="onTrendDateChange"
            />

            <stats-compare-panel v-else :compare="compareData" />
          </view>
        </view>
      </scroll-view>
    </view>
    <page-tab-bar />
  </view>
</template>

<script>
  import PageTitleBar from '@/components/base/PageTitleBar/PageTitleBar.vue';
  import ListSkeleton from '@/components/base/ListSkeleton/ListSkeleton.vue';
  import StatsComparePanel from '@/components/stats/StatsComparePanel/StatsComparePanel.vue';
  import StatsOverviewCard from '@/components/stats/StatsOverviewCard/StatsOverviewCard.vue';
  import StatsRankingList from '@/components/stats/StatsRankingList/StatsRankingList.vue';
  import StatsTabBar from '@/components/stats/StatsTabBar/StatsTabBar.vue';
  import StatsTrendChart from '@/components/stats/StatsTrendChart/StatsTrendChart.vue';
  import StatsTrendPanel from '@/components/stats/StatsTrendPanel/StatsTrendPanel.vue';
  import {
    fetchStatsCompare,
    fetchStatsOverview,
    fetchStatsRanking,
    fetchStatsTrend,
  } from '@/api/stats.js';
  import {
    formatStatsTrendDateLabel,
    resolveStatsTrendParams,
  } from '@/utils/statsTimeFilter.js';
  import dayjs from 'dayjs';

  export default {
    name: 'StatsPage',
    components: {
      PageTitleBar,
      ListSkeleton,
      StatsTabBar,
      StatsOverviewCard,
      StatsTrendChart,
      StatsRankingList,
      StatsTrendPanel,
      StatsComparePanel,
    },
    data() {
      return {
        activeTab: 'overview',
        pageLoading: true,
        overview: {
          totalTokens: 0,
        },
        trendPoints: [],
        trendGranularity: 'week',
        trendAnchorDate: dayjs().format('YYYY-MM-DD'),
        ranking: [],
        compareData: {
          current: {},
          previous: {},
        },
      };
    },
    computed: {
      trendDateLabel() {
        void this.$store.state.preferenceRevision;
        return formatStatsTrendDateLabel(this.trendGranularity, this.trendAnchorDate);
      },
      trendQueryParams() {
        return resolveStatsTrendParams(this.trendGranularity, this.trendAnchorDate);
      },
    },
    onReady() {
      this.loadOverviewData();
    },
    mounted() {
      uni.$on('app-locale-changed', this.onLocaleChanged);
    },
    beforeDestroy() {
      uni.$off('app-locale-changed', this.onLocaleChanged);
    },
    methods: {
      onLocaleChanged() {
        if (this.activeTab === 'compare') {
          this.loadCompareData();
        } else if (this.activeTab === 'trend') {
          this.loadTrendData();
        } else {
          this.loadOverviewData();
        }
      },
      onTabChange(tab) {
        if (tab === 'overview') {
          this.loadOverviewData();
        } else if (tab === 'trend') {
          this.loadTrendData();
        } else {
          this.loadCompareData();
        }
      },
      onGranularityChange(value) {
        this.trendGranularity = value;
        this.loadTrendData();
      },
      onTrendDateChange(anchorDate) {
        this.trendAnchorDate = anchorDate;
        this.loadTrendData();
      },
      async loadOverviewData() {
        this.pageLoading = true;
        try {
          const [overview, trend, ranking] = await Promise.all([
            fetchStatsOverview(),
            fetchStatsTrend({ granularity: 'week' }),
            fetchStatsRanking({ limit: 10 }),
          ]);
          this.overview = overview;
          this.trendPoints = trend.points || [];
          this.ranking = ranking;
        } finally {
          this.pageLoading = false;
        }
      },
      async loadTrendData() {
        this.pageLoading = true;
        try {
          const trend = await fetchStatsTrend(this.trendQueryParams);
          this.trendPoints = trend.points || [];
        } finally {
          this.pageLoading = false;
        }
      },
      async loadCompareData() {
        this.pageLoading = true;
        try {
          this.compareData = await fetchStatsCompare();
        } finally {
          this.pageLoading = false;
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
    padding: 0 $spacing-lg calc(#{$spacing-xl} + #{$spacing-lg});
  }

  .page__loading {
    padding-top: $spacing-md;
  }

  .page__tab-panel {
    animation: page-shell-fade-in 0.28s cubic-bezier(0.4, 0, 0.2, 1) both;
  }

  .page__section {
    display: block;
    margin-top: $spacing-md;
  }
</style>
