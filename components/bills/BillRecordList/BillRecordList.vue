<template>
  <view class="bill-record-list">
    <view class="bill-record-list__header">
      <text class="bill-record-list__title">{{ $t('bills.recordsTitle') }}</text>
      <text class="bill-record-list__action" @click.stop="onActionClick">
        {{ expanded ? $t('bills.collapse') : $t('bills.expand') }}
      </text>
    </view>
    <view class="bill-record-list__scroll-wrap">
      <scroll-view
        class="bill-record-list__scroll"
        scroll-y
        :show-scrollbar="false"
        refresher-enabled
        :refresher-triggered="paginatedRefreshing"
        :refresher-background="refresherBackground"
        :lower-threshold="80"
        @refresherrefresh="onRefresh"
        @refresherrestore="onPaginatedRefresherEnd"
        @refresherabort="onPaginatedRefresherEnd"
        @scroll="onScroll"
        @scrolltolower="onLoadMore"
      >
        <view class="bill-record-list__body">
          <list-skeleton v-if="paginatedLoading && paginatedItems.length === 0" :count="5" />
          <template v-else>
            <view v-for="group in groups" :key="group.label" class="bill-record-list__group">
              <text class="bill-record-list__group-label">{{ group.label }}</text>
              <bill-record-item
                v-for="record in group.items"
                :key="record.id"
                :record="record"
                @click="onItemClick"
              />
            </view>
            <view
              v-if="paginatedLoading && paginatedItems.length > 0"
              class="bill-record-list__footer"
            >
              <u-loadmore status="loading" />
            </view>
            <view
              v-else-if="paginatedFinished && paginatedItems.length > 0"
              class="bill-record-list__footer"
            >
              <u-loadmore status="nomore" :nomore-text="$t('list.noMore')" />
            </view>
            <view
              v-if="!paginatedLoading && paginatedItems.length === 0"
              class="bill-record-list__empty"
            >
              <text class="bill-record-list__empty-text">{{ $t('bills.emptyRecords') }}</text>
            </view>
          </template>
        </view>
      </scroll-view>
      <view v-if="paginatedTotal > 0 && paginatedItems.length > 0" class="bill-record-list__total">
        <text class="bill-record-list__count">{{ $t('list.totalCount', { count: paginatedTotal }) }}</text>
      </view>
    </view>
  </view>
</template>

<script>
  import BillRecordItem from '@/components/bills/BillRecordItem/BillRecordItem.vue';
  import ListSkeleton from '@/components/base/ListSkeleton/ListSkeleton.vue';
  import paginatedListMixin from '@/mixins/paginatedListMixin.js';
  import { fetchBillRecords } from '@/api/bills.js';
  import { groupBillRecords } from '@/utils/billDisplay.js';
  import { MONTHLY_OVERVIEW_CHANGED } from '@/utils/monthlyOverviewEvents.js';

  export default {
    name: 'BillRecordList',
    components: {
      BillRecordItem,
      ListSkeleton,
    },
    mixins: [paginatedListMixin],
    props: {
      filters: {
        type: Object,
        default: () => ({
          month: '',
          platform: 'all',
        }),
      },
      expanded: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        paginatedPageSize: 10,
      };
    },
    computed: {
      groups() {
        return groupBillRecords(this.paginatedItems);
      },
      filterQueryKey() {
        return JSON.stringify(this.filters || {});
      },
    },
    watch: {
      filterQueryKey(newKey, oldKey) {
        if (!oldKey || newKey === oldKey) {
          return;
        }
        this.paginatedRefresh();
      },
    },
    mounted() {
      uni.$on(MONTHLY_OVERVIEW_CHANGED, this.onUsageChanged);
      this.paginatedInit();
    },
    beforeDestroy() {
      uni.$off(MONTHLY_OVERVIEW_CHANGED, this.onUsageChanged);
    },
    methods: {
      onUsageChanged() {
        this.paginatedRefresh();
      },
      getPaginatedFetchFn() {
        const { month, platform } = this.filters;
        return (params) =>
          fetchBillRecords({
            ...params,
            month,
            platform,
          });
      },
      async onRefresh() {
        await this.onPullRefresh();
      },
      onLoadMore() {
        this.paginatedLoadMore();
      },
      onScroll(e) {
        this.$emit('scroll', e.detail?.scrollTop || 0);
      },
      onItemClick(record) {
        this.$emit('item-click', record);
      },
      onActionClick() {
        this.$emit('action-click');
      },
    },
  };
</script>

<style lang="scss" scoped>
  .bill-record-list {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  .bill-record-list__header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-md;
  }

  .bill-record-list__title {
    color: $color-text-primary;
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
  }

  .bill-record-list__action {
    color: $color-secondary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }

  .bill-record-list__scroll-wrap {
    position: relative;
    flex: 1;
    min-height: 0;
    width: 100%;
  }

  .bill-record-list__scroll {
    width: 100%;
    height: 100%;
  }

  .bill-record-list__body {
    display: flex;
    flex-direction: column;
    padding: $spacing-lg;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
    transition:
      background-color 0.28s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .bill-record-list__group {
    margin-top: $spacing-md;

    &:first-child {
      margin-top: 0;
    }
  }

  .bill-record-list__group-label {
    display: block;
    margin-bottom: $spacing-xs;
    color: $color-text-placeholder;
    font-size: $font-size-xs;
  }

  .bill-record-list__footer {
    padding: $spacing-sm 0 $spacing-md;
  }

  .bill-record-list__total {
    position: absolute;
    right: $spacing-md;
    bottom: $spacing-sm;
    z-index: 1;
    padding: 4rpx $spacing-sm;
    border-radius: 20rpx;
    background-color: $color-surface-glass;
    pointer-events: none;
  }

  .bill-record-list__count {
    color: $color-text-placeholder;
    font-size: $font-size-xs;
  }

  .bill-record-list__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-xl 0;
  }

  .bill-record-list__empty-text {
    color: $color-text-placeholder;
    font-size: $font-size-sm;
  }
</style>
