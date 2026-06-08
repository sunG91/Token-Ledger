<template>
  <view class="stats-trend-chart">
    <view class="stats-trend-chart__header">
      <text class="stats-trend-chart__title">{{ title }}</text>
      <text class="stats-trend-chart__legend">Tokens</text>
    </view>
    <view class="stats-trend-chart__canvas-wrap">
      <canvas
        :canvas-id="canvasId"
        :id="canvasId"
        class="stats-trend-chart__canvas"
        :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
        disable-scroll
        @touchstart="onTouch"
        @touchmove="onTouch"
        @touchend="onTouchEnd"
      />
      <view
        v-if="activePoint"
        class="stats-trend-chart__tooltip"
        :style="tooltipStyle"
      >
        <text class="stats-trend-chart__tooltip-date">{{
          activePoint.tooltipLabel || activePoint.label
        }}</text>
        <text class="stats-trend-chart__tooltip-value">
          {{ formatToken(activePoint.value) }} tokens
        </text>
      </view>
    </view>
  </view>
</template>

<script>
  import { formatToken } from '@/utils/format.js';
  import { drawLineChart, findNearestChartPoint } from '@/utils/lineChartDrawer.js';

  let chartSeed = 0;

  export default {
    name: 'StatsTrendChart',
    props: {
      title: {
        type: String,
        default: '项目消耗趋势',
      },
      points: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      chartSeed += 1;
      return {
        canvasId: `stats-trend-chart-${chartSeed}`,
        canvasWidth: 0,
        canvasHeight: 0,
        activeIndex: -1,
        chartPadding: { top: 24, right: 16, bottom: 32, left: 40 },
      };
    },
    computed: {
      activePoint() {
        if (this.activeIndex < 0 || !this.points[this.activeIndex]) return null;
        return this.points[this.activeIndex];
      },
      tooltipStyle() {
        if (!this.activePoint || !this.canvasWidth) return {};
        const chartWidth = this.canvasWidth - this.chartPadding.left - this.chartPadding.right;
        const stepX =
          this.points.length > 1 ? chartWidth / (this.points.length - 1) : 0;
        const x = this.chartPadding.left + stepX * this.activeIndex;
        const left = Math.min(Math.max(x - 60, 8), this.canvasWidth - 128);
        return {
          left: `${left}px`,
          top: '12px',
        };
      },
    },
    watch: {
      points: {
        deep: true,
        handler() {
          this.$nextTick(() => this.renderChart());
        },
      },
      activeIndex() {
        this.renderChart();
      },
    },
    mounted() {
      this.initCanvasSize();
      uni.onWindowResize(this.initCanvasSize);
      this.$nextTick(() => {
        setTimeout(() => this.renderChart(), 80);
      });
    },
    beforeDestroy() {
      uni.offWindowResize(this.initCanvasSize);
    },
    methods: {
      formatToken,
      initCanvasSize() {
        const query = uni.createSelectorQuery().in(this);
        query
          .select('.stats-trend-chart__canvas-wrap')
          .boundingClientRect((rect) => {
            if (!rect?.width) return;
            this.canvasWidth = Math.floor(rect.width);
            this.canvasHeight = uni.upx2px(320);
            this.$nextTick(() => this.renderChart());
          })
          .exec();
      },
      renderChart() {
        if (!this.canvasWidth || !this.canvasHeight) return;
        const ctx = uni.createCanvasContext(this.canvasId, this);
        drawLineChart(ctx, {
          width: this.canvasWidth,
          height: this.canvasHeight,
          points: this.points,
          padding: this.chartPadding,
          activeIndex: this.activeIndex,
        });
      },
      onTouch(e) {
        const touch = e.touches?.[0] || e.changedTouches?.[0];
        if (!touch) return;

        const query = uni.createSelectorQuery().in(this);
        query
          .select(`#${this.canvasId}`)
          .boundingClientRect((rect) => {
            const chartWidth = this.canvasWidth - this.chartPadding.left - this.chartPadding.right;
            const relativeX =
              typeof touch.x === 'number'
                ? touch.x
                : (touch.clientX || 0) - (rect?.left || 0);
            this.activeIndex = findNearestChartPoint(
              relativeX,
              this.points,
              this.chartPadding,
              this.canvasWidth,
              chartWidth
            );
          })
          .exec();
      },
      onTouchEnd() {
        setTimeout(() => {
          this.activeIndex = -1;
        }, 1200);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .stats-trend-chart {
    padding: $spacing-lg;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
  }

  .stats-trend-chart__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-sm;
  }

  .stats-trend-chart__title {
    color: $color-text-primary;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
  }

  .stats-trend-chart__legend {
    color: $color-text-placeholder;
    font-size: $font-size-xs;
  }

  .stats-trend-chart__canvas-wrap {
    position: relative;
    width: 100%;
    height: 320rpx;
  }

  .stats-trend-chart__canvas {
    display: block;
    width: 100%;
    height: 320rpx;
  }

  .stats-trend-chart__tooltip {
    position: absolute;
    z-index: 2;
    min-width: 140rpx;
    padding: 10rpx 16rpx;
    border-radius: 12rpx;
    background-color: rgba(45, 52, 54, 0.88);
    pointer-events: none;
  }

  .stats-trend-chart__tooltip-date {
    display: block;
    color: rgba(255, 255, 255, 0.78);
    font-size: 20rpx;
  }

  .stats-trend-chart__tooltip-value {
    display: block;
    margin-top: 4rpx;
    color: #fff;
    font-size: 22rpx;
    font-weight: $font-weight-medium;
  }
</style>
