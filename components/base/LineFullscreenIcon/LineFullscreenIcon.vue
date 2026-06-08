<template>
  <view class="line-fs-icon" :class="modeClass" :style="wrapStyle">
    <view
      v-for="corner in corners"
      :key="corner"
      class="line-fs-icon__corner"
      :class="'line-fs-icon__corner--' + corner"
      :style="cornerStyle"
    />
  </view>
</template>

<script>
  export default {
    name: 'LineFullscreenIcon',
    props: {
      /** expand 最大化 | shrink 缩小 */
      mode: {
        type: String,
        default: 'expand',
        validator: (val) => ['expand', 'shrink'].includes(val),
      },
      size: {
        type: Number,
        default: 32,
      },
      color: {
        type: String,
        default: '#2D3436',
      },
      strokeWidth: {
        type: Number,
        default: 3,
      },
    },
    computed: {
      corners() {
        return ['tl', 'tr', 'bl', 'br'];
      },
      modeClass() {
        return `line-fs-icon--${this.mode}`;
      },
      wrapStyle() {
        const size = `${this.size}rpx`;
        return {
          width: size,
          height: size,
        };
      },
      cornerStyle() {
        const arm = Math.max(Math.round(this.size * 0.42), 12);
        return {
          width: `${arm}rpx`,
          height: `${arm}rpx`,
          borderColor: this.color,
          borderWidth: `${this.strokeWidth}rpx`,
        };
      },
    },
  };
</script>

<style lang="scss" scoped>
  .line-fs-icon {
    position: relative;
    flex-shrink: 0;
  }

  .line-fs-icon__corner {
    position: absolute;
    border-style: solid;
    box-sizing: border-box;
  }

  /* 最大化：四角向外 */
  .line-fs-icon--expand {
    .line-fs-icon__corner--tl {
      top: 0;
      left: 0;
      border-right: none !important;
      border-bottom: none !important;
    }

    .line-fs-icon__corner--tr {
      top: 0;
      right: 0;
      border-left: none !important;
      border-bottom: none !important;
    }

    .line-fs-icon__corner--bl {
      bottom: 0;
      left: 0;
      border-top: none !important;
      border-right: none !important;
    }

    .line-fs-icon__corner--br {
      right: 0;
      bottom: 0;
      border-top: none !important;
      border-left: none !important;
    }
  }

  /* 缩小：四角向内收 */
  .line-fs-icon--shrink {
    .line-fs-icon__corner--tl {
      top: 22%;
      left: 22%;
      border-right: none !important;
      border-bottom: none !important;
    }

    .line-fs-icon__corner--tr {
      top: 22%;
      right: 22%;
      border-left: none !important;
      border-bottom: none !important;
    }

    .line-fs-icon__corner--bl {
      bottom: 22%;
      left: 22%;
      border-top: none !important;
      border-right: none !important;
    }

    .line-fs-icon__corner--br {
      right: 22%;
      bottom: 22%;
      border-top: none !important;
      border-left: none !important;
    }
  }
</style>
