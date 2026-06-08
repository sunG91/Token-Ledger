<template>
  <view class="model-donut" @tap="onRingTap">
    <view class="model-donut__ring" :style="ringStyle">
      <view class="model-donut__hole" />
    </view>
  </view>
</template>

<script>
  import { getModelChartColor } from '@/constants/bills.js';

  export default {
    name: 'ModelDonutChart',
    props: {
      items: {
        type: Array,
        default: () => [],
      },
      activeKey: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        ringSizePx: 0,
        holeSizePx: 0,
      };
    },
    computed: {
      chartSegments() {
        const segments = (this.items || []).filter((item) => item.percent > 0);
        let offset = 0;
        return segments.map((item) => {
          const startAngle = offset * 3.6;
          offset += item.percent;
          const endAngle = offset * 3.6;
          return {
            ...item,
            chartKey: item.chartKey || item.platformId,
            startAngle,
            endAngle,
          };
        });
      },
      ringStyle() {
        if (!this.chartSegments.length) {
          return { background: '#F1F2F6' };
        }

        const hasActive = !!this.activeKey;
        let offset = 0;
        const stops = this.chartSegments.map((item) => {
          const start = offset;
          offset += item.percent;
          const dimmed = hasActive && item.chartKey !== this.activeKey;
          const color = getModelChartColor(item.platformId, dimmed ? 0.35 : 1);
          return `${color} ${start}% ${offset}%`;
        });

        return {
          background: `conic-gradient(${stops.join(', ')})`,
        };
      },
    },
    mounted() {
      this.ringSizePx = uni.upx2px(180);
      this.holeSizePx = uni.upx2px(108);
    },
    methods: {
      onRingTap(e) {
        const { x = 0, y = 0 } = e.detail || {};
        const cx = this.ringSizePx / 2;
        const cy = this.ringSizePx / 2;
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const outerR = this.ringSizePx / 2;
        const innerR = this.holeSizePx / 2;

        if (dist < innerR || dist > outerR) return;

        let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        angle = (angle + 360) % 360;

        const segment = this.chartSegments.find(
          (item) => angle >= item.startAngle && angle < item.endAngle
        );
        if (segment) {
          this.$emit('segment-click', segment.chartKey);
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .model-donut {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 180rpx;
    height: 180rpx;
  }

  .model-donut__ring {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 180rpx;
    height: 180rpx;
    border-radius: $radius-circle;
  }

  .model-donut__hole {
    width: 108rpx;
    height: 108rpx;
    border-radius: $radius-circle;
    background-color: $color-bg-card;
  }
</style>
