/**
 * 分页列表 Mixin — 下拉刷新 + 触底加载更多
 * 使用方需实现 getPaginatedFetchFn() 返回请求函数
 */
export default {
  data() {
    return {
      paginatedItems: [],
      paginatedTotal: 0,
      paginatedPage: 0,
      paginatedPageSize: 20,
      paginatedLoading: false,
      paginatedRefreshing: false,
      paginatedFinished: false,
      paginatedRefreshResetTimer: null,
    };
  },
  beforeDestroy() {
    this.clearPaginatedRefreshTimer();
  },
  methods: {
    getPaginatedFetchFn() {
      throw new Error('getPaginatedFetchFn must be implemented');
    },
    clearPaginatedRefreshTimer() {
      if (this.paginatedRefreshResetTimer) {
        clearTimeout(this.paginatedRefreshResetTimer);
        this.paginatedRefreshResetTimer = null;
      }
    },
    stopPullRefresh() {
      this.clearPaginatedRefreshTimer();
      this.paginatedRefreshResetTimer = setTimeout(() => {
        this.paginatedRefreshing = false;
        this.paginatedRefreshResetTimer = null;
      }, 320);
    },
    onPaginatedRefresherEnd() {
      this.stopPullRefresh();
    },
    async paginatedInit() {
      await this.paginatedFetch({ refresh: true });
    },
    async paginatedRefresh() {
      if (this.paginatedLoading) {
        return;
      }
      await this.paginatedFetch({ refresh: true });
    },
    async onPullRefresh() {
      this.clearPaginatedRefreshTimer();
      this.paginatedRefreshing = true;

      try {
        if (this.paginatedLoading) {
          return { refreshed: false, skipped: true };
        }
        await this.paginatedFetch({ refresh: true });
        return { refreshed: true, skipped: false };
      } catch (error) {
        return { refreshed: false, skipped: false, error };
      } finally {
        this.stopPullRefresh();
      }
    },
    async paginatedLoadMore() {
      await this.paginatedFetch({ refresh: false });
    },
    async paginatedFetch({ refresh = false } = {}) {
      if (this.paginatedLoading) {
        return;
      }
      if (!refresh && this.paginatedFinished) {
        return;
      }

      const nextPage = refresh ? 1 : this.paginatedPage + 1;
      this.paginatedLoading = true;

      try {
        const fetchFn = this.getPaginatedFetchFn();
        const res = await Promise.resolve(
          fetchFn({
            page: nextPage,
            pageSize: this.paginatedPageSize,
          })
        );
        const items = res.items || [];

        this.paginatedItems = refresh ? items : [...this.paginatedItems, ...items];
        this.paginatedTotal = res.total ?? this.paginatedTotal;
        this.paginatedPage = res.page ?? nextPage;
        this.paginatedFinished =
          this.paginatedItems.length >= this.paginatedTotal ||
          items.length < this.paginatedPageSize;
      } catch (error) {
        if (refresh) {
          this.paginatedItems = [];
          this.paginatedTotal = 0;
          this.paginatedPage = 0;
          this.paginatedFinished = true;
        }
      } finally {
        this.paginatedLoading = false;
      }
    },
  },
};
