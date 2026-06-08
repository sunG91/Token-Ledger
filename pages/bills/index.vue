<template>
  <view class="page" :class="appShellClass" :style="appShellStyle">
    <page-title-bar :title="$t('bills.title')" />
    <view class="page__body">
      <bills-filter-bar
        class="page__filter"
        :time-value="timeValue"
        :custom-time="customTime"
        :platform-value="platformValue"
        @time-change="onTimeChange"
        @custom-time-change="onCustomTimeChange"
        @platform-change="onPlatformChange"
      />
      <bills-summary-card :summary="summary" :collapse-progress="summaryCollapse" />
      <model-stats-card
        v-show="focusedSection !== 'records'"
        :items="modelStats"
        :expanded="focusedSection === 'modelStats'"
        class="page__model-stats"
        :class="{ 'page__model-stats--focused': focusedSection === 'modelStats' }"
        @action-click="onModelStatsAction"
      />
      <bill-record-list
        v-show="focusedSection !== 'modelStats'"
        ref="billRecordList"
        class="page__list"
        :class="{ 'page__list--focused': focusedSection === 'records' }"
        :filters="billFilters"
        :expanded="focusedSection === 'records'"
        @action-click="onRecordsAction"
        @scroll="onListScroll"
        @item-click="onRecordClick"
      />
    </view>
    <page-tab-bar />
  </view>
</template>

<script>
  import BillRecordList from '@/components/bills/BillRecordList/BillRecordList.vue';
  import BillsFilterBar from '@/components/bills/BillsFilterBar/BillsFilterBar.vue';
  import BillsSummaryCard from '@/components/bills/BillsSummaryCard/BillsSummaryCard.vue';
  import ModelStatsCard from '@/components/bills/ModelStatsCard/ModelStatsCard.vue';
  import PageTitleBar from '@/components/base/PageTitleBar/PageTitleBar.vue';
  import { fetchBillModelStats, fetchBillSummary } from '@/api/bills.js';
  import { resolveBillTimeParams } from '@/utils/billTimeFilter.js';

  const SUMMARY_COLLAPSE_DISTANCE = 100;

  export default {
    name: 'BillsPage',
    components: {
      PageTitleBar,
      BillsFilterBar,
      BillsSummaryCard,
      ModelStatsCard,
      BillRecordList,
    },
    data() {
      return {
        timeValue: 'this_month',
        customTime: null,
        platformValue: 'all',
        summary: {
          totalTokens: 0,
        },
        modelStats: [],
        summaryCollapse: 0,
        focusedSection: null,
      };
    },
    computed: {
      billFilters() {
        return {
          ...resolveBillTimeParams(this.timeValue, this.customTime),
          platform: this.platformValue,
        };
      },
    },
    onReady() {
      this.loadSummaryAndStats();
    },
    onShow() {
      this.loadSummaryAndStats();
      this.$refs.billRecordList?.paginatedRefresh?.();
    },
    mounted() {
      uni.$on('app-locale-changed', this.onLocaleChanged);
    },
    beforeDestroy() {
      uni.$off('app-locale-changed', this.onLocaleChanged);
    },
    methods: {
      onLocaleChanged() {
        this.onFiltersChange();
      },
      onModelStatsAction() {
        this.focusedSection = this.focusedSection === 'modelStats' ? null : 'modelStats';
      },
      onRecordsAction() {
        this.focusedSection = this.focusedSection === 'records' ? null : 'records';
      },
      onListScroll(scrollTop) {
        this.summaryCollapse = Math.min(Math.max(scrollTop / SUMMARY_COLLAPSE_DISTANCE, 0), 1);
      },
      onTimeChange(value) {
        this.timeValue = value;
        this.customTime = null;
        this.onFiltersChange();
      },
      onCustomTimeChange(customTime) {
        this.customTime = customTime;
        this.onFiltersChange();
      },
      onPlatformChange(value) {
        this.platformValue = value;
        this.onFiltersChange();
      },
      onFiltersChange() {
        this.summaryCollapse = 0;
        this.loadSummaryAndStats();
      },
      async loadSummaryAndStats() {
        const params = this.billFilters;
        const [summary, modelStats] = await Promise.all([
          fetchBillSummary(params),
          fetchBillModelStats(params),
        ]);
        this.summary = summary;
        this.modelStats = modelStats;
      },
      onRecordClick(record) {
        uni.showToast({
          title: `${record.platformLabel} · ${record.tokenCount} token`,
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

  .page__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  .page__filter {
    flex-shrink: 0;
    margin-bottom: $spacing-md;
  }

  .page__model-stats {
    flex-shrink: 0;
  }

  .page__model-stats--focused {
    flex: 1;
    min-height: 0;
  }

  .page__list {
    flex: 1;
    min-height: 0;
    margin-top: $spacing-md;
    padding: 0 $spacing-lg $spacing-md;
  }

  .page__list--focused {
    margin-top: $spacing-sm;
  }
</style>
