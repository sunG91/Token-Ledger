<template>
  <view class="model-stats" :class="{ 'model-stats--expanded': expanded }">
    <view class="model-stats__header">
      <text class="model-stats__title">{{ $t('bills.modelStats') }}</text>
      <text
        v-if="hasExtraItems"
        class="model-stats__action"
        @click.stop="onActionClick"
      >
        {{ expanded ? $t('bills.collapse') : $t('bills.expand') }}
      </text>
    </view>
    <view class="model-stats__body">
      <view class="model-stats__main">
        <view class="model-stats__list">
          <view
            v-for="item in mainListItems"
            :key="item.chartKey"
            class="model-stats__row"
            :class="{ 'model-stats__row--active': item.chartKey === activeKey }"
            @click="onRowClick(item.chartKey)"
          >
            <view v-if="item.platformId === 'others'" class="model-stats__others-icon">
              <u-icon name="more-dot-fill" color="#636E72" size="18" />
            </view>
            <platform-icon v-else :platform-id="item.platformId" :size="56" />
            <view class="model-stats__info">
              <text class="model-stats__name">{{ item.platformLabel }}</text>
              <text class="model-stats__meta">
                {{ formatToken(item.tokenCount) }} token ({{ formatPercent(item.percent) }}%)
              </text>
            </view>
          </view>
        </view>
        <model-donut-chart
          class="model-stats__chart"
          :items="chartItems"
          :active-key="activeKey"
          @segment-click="onSegmentClick"
        />
      </view>
      <view
        v-if="hasExtraItems"
        class="model-stats__extra"
        :class="{ 'model-stats__extra--open': expanded }"
      >
        <view class="model-stats__extra-inner">
          <text class="model-stats__extra-label">{{ $t('bills.otherDetails') }}</text>
          <view
            v-for="(item, index) in extraItems"
            :key="item.chartKey"
            class="model-stats__row model-stats__row--extra"
            :class="{ 'model-stats__row--active': item.chartKey === activeKey }"
            :style="{ transitionDelay: expanded ? `${index * 40}ms` : '0ms' }"
            @click="onRowClick(item.chartKey)"
          >
            <platform-icon :platform-id="item.platformId" :size="48" />
            <view class="model-stats__info">
              <text class="model-stats__name">{{ item.platformLabel }}</text>
              <text class="model-stats__meta">
                {{ formatToken(item.tokenCount) }} token ({{ formatPercent(item.percent) }}%)
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import ModelDonutChart from '@/components/bills/ModelDonutChart/ModelDonutChart.vue';
  import PlatformIcon from '@/components/base/PlatformIcon/PlatformIcon.vue';
  import { formatToken } from '@/utils/format.js';
  import {
    MODEL_STATS_MAX_DISPLAY,
    aggregateModelStats,
    getModelStatsExpandedChartItems,
    getModelStatsOverflowItems,
    getModelStatsTopItems,
  } from '@/utils/modelStats.js';

  export default {
    name: 'ModelStatsCard',
    components: {
      ModelDonutChart,
      PlatformIcon,
    },
    props: {
      items: {
        type: Array,
        default: () => [],
      },
      expanded: {
        type: Boolean,
        default: false,
      },
      maxDisplay: {
        type: Number,
        default: MODEL_STATS_MAX_DISPLAY,
      },
    },
    data() {
      return {
        activeKey: '',
      };
    },
    computed: {
      mainListItems() {
        if (this.expanded) {
          return getModelStatsTopItems(this.items, this.maxDisplay);
        }
        return aggregateModelStats(this.items, this.maxDisplay);
      },
      chartItems() {
        if (this.expanded) {
          return getModelStatsExpandedChartItems(this.items);
        }
        return aggregateModelStats(this.items, this.maxDisplay);
      },
      extraItems() {
        return getModelStatsOverflowItems(this.items, this.maxDisplay);
      },
      hasExtraItems() {
        return this.extraItems.length > 0;
      },
    },
    watch: {
      items() {
        this.activeKey = '';
      },
      expanded(value) {
        if (value && this.activeKey === 'others') {
          this.activeKey = '';
        }
      },
    },
    methods: {
      formatToken,
      formatPercent(value) {
        const num = Number(value) || 0;
        return num.toFixed(1);
      },
      onSegmentClick(chartKey) {
        this.activeKey = this.activeKey === chartKey ? '' : chartKey;
      },
      onRowClick(chartKey) {
        this.activeKey = this.activeKey === chartKey ? '' : chartKey;
      },
      onActionClick() {
        this.$emit('action-click');
      },
    },
  };
</script>

<style lang="scss" scoped>
  .model-stats {
    display: flex;
    flex-direction: column;
    margin: 0 $spacing-lg $spacing-md;
    padding: $spacing-lg;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
  }

  .model-stats--expanded {
    flex: 1;
    min-height: 0;
    margin-bottom: $spacing-sm;
  }

  .model-stats__header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
  }

  .model-stats__title {
    color: $color-text-primary;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
  }

  .model-stats__action {
    color: $color-secondary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }

  .model-stats__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    margin-top: $spacing-md;
  }

  .model-stats__main {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: $spacing-sm;
  }

  .model-stats__list {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    gap: $spacing-sm;
  }

  .model-stats__row {
    display: flex;
    align-items: center;
    min-width: 0;
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-button;
    transition: background-color 0.2s ease;
  }

  .model-stats__row--active {
    background-color: rgba(108, 92, 231, 0.1);

    .model-stats__name {
      color: $color-primary;
      font-weight: $font-weight-semibold;
    }
  }

  .model-stats__others-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 56rpx;
    height: 56rpx;
    border-radius: 20rpx;
    background-color: $color-bg-muted;
  }

  .model-stats__info {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    margin-left: $spacing-sm;
  }

  .model-stats__name {
    color: $color-text-primary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }

  .model-stats__meta {
    margin-top: 4rpx;
    color: $color-text-secondary;
    font-size: $font-size-xs;
  }

  .model-stats__amount {
    flex-shrink: 0;
    margin-left: $spacing-xs;
    color: $color-text-secondary;
    font-size: $font-size-xs;
  }

  .model-stats__chart {
    flex-shrink: 0;
  }

  .model-stats__extra {
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition:
      max-height 0.32s ease,
      opacity 0.24s ease,
      margin-top 0.32s ease;
  }

  .model-stats__extra--open {
    max-height: 600rpx;
    margin-top: $spacing-sm;
    opacity: 1;
  }

  .model-stats__extra-inner {
    padding-top: $spacing-sm;
    border-top: 1rpx solid $color-bg-muted;
  }

  .model-stats__extra-label {
    display: block;
    margin-bottom: $spacing-xs;
    padding: 0 $spacing-sm;
    color: $color-text-placeholder;
    font-size: $font-size-xs;
  }

  .model-stats__row--extra {
    opacity: 0;
    transform: translateY(-12rpx);
    transition:
      opacity 0.28s ease,
      transform 0.28s ease,
      background-color 0.2s ease;
  }

  .model-stats__extra--open .model-stats__row--extra {
    opacity: 1;
    transform: translateY(0);
  }
</style>
