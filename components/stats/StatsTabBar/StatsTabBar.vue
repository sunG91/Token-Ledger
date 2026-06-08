<template>
  <view class="stats-tab-bar">
    <view
      v-for="tab in tabs"
      :key="tab.value"
      class="stats-tab-bar__item"
      :class="{ 'stats-tab-bar__item--active': tab.value === value }"
      @click="onTabClick(tab.value)"
    >
      <text class="stats-tab-bar__text">{{ tab.label }}</text>
    </view>
  </view>
</template>

<script>
  export default {
    name: 'StatsTabBar',
    props: {
      value: {
        type: String,
        default: 'overview',
      },
    },
    computed: {
      tabs() {
        void this.$store.state.preferenceRevision;
        return [
          { value: 'overview', label: this.$t('stats.tabOverview') },
          { value: 'trend', label: this.$t('stats.tabTrend') },
          { value: 'compare', label: this.$t('stats.tabCompare') },
        ];
      },
    },
    methods: {
      onTabClick(tabValue) {
        if (tabValue !== this.value) {
          this.$emit('input', tabValue);
          this.$emit('change', tabValue);
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .stats-tab-bar {
    display: flex;
    flex-shrink: 0;
    margin: $spacing-sm $spacing-lg $spacing-md;
    padding: 6rpx;
    border-radius: 999rpx;
    background-color: $color-tab-pill-bg;
    box-shadow: 0 2rpx 16rpx rgba(45, 52, 54, 0.05);
    gap: 6rpx;
  }

  .stats-tab-bar__item {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    height: 68rpx;
    border-radius: 999rpx;
    transition: all 0.24s ease;
  }

  .stats-tab-bar__item--active {
    background: $color-primary-gradient;
    box-shadow: 0 6rpx 18rpx rgba(9, 132, 227, 0.22);
  }

  .stats-tab-bar__text {
    color: $color-text-secondary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    transition: color 0.24s ease;
  }

  .stats-tab-bar__item--active .stats-tab-bar__text {
    color: $color-text-inverse;
    font-weight: $font-weight-semibold;
  }
</style>
