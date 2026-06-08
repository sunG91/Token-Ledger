<template>
  <view class="recent-list">
    <view class="recent-list__header">
      <text class="recent-list__title">{{ $t('home.recentTitle') }}</text>
      <text v-if="paginatedTotal > 0" class="recent-list__count">{{
        $t('list.totalCount', { count: paginatedTotal })
      }}</text>
    </view>
    <view class="recent-list__scroll-wrap">
      <scroll-view
        class="recent-list__scroll"
        scroll-y
        :show-scrollbar="false"
        refresher-enabled
        :refresher-triggered="paginatedRefreshing"
        :refresher-background="refresherBackground"
        :lower-threshold="80"
        @refresherrefresh="onRefresh"
        @refresherrestore="onPaginatedRefresherEnd"
        @refresherabort="onPaginatedRefresherEnd"
        @scrolltolower="onLoadMore"
      >
        <view class="recent-list__body">
          <list-skeleton v-if="paginatedLoading && paginatedItems.length === 0" :count="4" />
          <template v-else>
            <recent-list-item
              v-for="item in paginatedItems"
              :key="item.id"
              :record="item"
              @click="onItemClick"
            />
            <view
              v-if="!paginatedLoading && paginatedItems.length === 0"
              class="recent-list__empty"
            >
              <text class="recent-list__empty-text">{{ $t('home.emptyRecords') }}</text>
            </view>
            <view v-else-if="paginatedFinished" class="recent-list__footer">
              <text class="recent-list__footer-text">{{ $t('home.noMoreRecent') }}</text>
            </view>
          </template>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
  import RecentListItem from '@/components/home/RecentList/RecentListItem.vue';
  import ListSkeleton from '@/components/base/ListSkeleton/ListSkeleton.vue';
  import paginatedListMixin from '@/mixins/paginatedListMixin.js';
  import { fetchRecentRecords } from '@/api/records.js';
  import { MONTHLY_OVERVIEW_CHANGED } from '@/utils/monthlyOverviewEvents.js';

  export default {
    name: 'RecentList',
    components: {
      RecentListItem,
      ListSkeleton,
    },
    mixins: [paginatedListMixin],
    mounted() {
      uni.$on('app-locale-changed', this.onLocaleChanged);
      uni.$on(MONTHLY_OVERVIEW_CHANGED, this.onUsageChanged);
      this.paginatedInit();
    },
    beforeDestroy() {
      uni.$off('app-locale-changed', this.onLocaleChanged);
      uni.$off(MONTHLY_OVERVIEW_CHANGED, this.onUsageChanged);
    },
    methods: {
      onLocaleChanged() {
        this.paginatedRefresh();
      },
      onUsageChanged() {
        this.paginatedRefresh();
      },
      getPaginatedFetchFn() {
        return fetchRecentRecords;
      },
      async onRefresh() {
        const result = await this.onPullRefresh();
        if (result?.skipped) {
          uni.showToast({
            title: this.$t('home.noMoreRecent'),
            icon: 'none',
            duration: 1500,
          });
          return;
        }
        uni.showToast({
          title: this.$t('home.noMoreRecent'),
          icon: 'none',
          duration: 1500,
        });
      },
      onLoadMore() {
        this.paginatedLoadMore();
      },
      onItemClick() {
        uni.showToast({ title: this.$t('home.recordDetailDev'), icon: 'none' });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .recent-list {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  .recent-list__header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-md;
  }

  .recent-list__title {
    color: $color-text-primary;
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
  }

  .recent-list__count {
    color: $color-text-placeholder;
    font-size: $font-size-sm;
  }

  .recent-list__scroll-wrap {
    flex: 1;
    min-height: 0;
    width: 100%;
  }

  .recent-list__scroll {
    width: 100%;
    height: 100%;
  }

  .recent-list__body {
    display: flex;
    flex-direction: column;
    min-height: 120rpx;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
    transition:
      background-color 0.28s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .recent-list__footer {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-md 0 $spacing-lg;
  }

  .recent-list__footer-text {
    color: $color-text-placeholder;
    font-size: $font-size-xs;
  }

  .recent-list__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-xl 0;
  }

  .recent-list__empty-text {
    color: $color-text-placeholder;
    font-size: $font-size-sm;
  }
</style>
