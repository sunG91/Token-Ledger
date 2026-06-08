<template>
  <scroll-view class="quick-chips" scroll-x :show-scrollbar="false">
    <view class="quick-chips__inner">
      <view
        v-for="item in localizedChips"
        :key="item.key"
        class="quick-chips__item"
        @click="onChipClick(item)"
      >
        <view class="quick-chips__icon" :style="{ backgroundColor: item.iconBg }">
          <u-icon :name="item.icon" :color="item.iconColor" size="14" />
        </view>
        <text class="quick-chips__text">{{ item.label }}</text>
      </view>
    </view>
  </scroll-view>
</template>

<script>
  import { pickRandomQuickChips } from '@/constants/quickChips.js';
  import { translate } from '@/i18n/index.js';
  import { mapState } from 'vuex';

  export default {
    name: 'QuickChips',
    props: {
      /** 同时展示几条，默认 2 */
      count: {
        type: Number,
        default: 2,
      },
      /** 变化时从预设池重新随机抽取整组 */
      refreshToken: {
        type: Number,
        default: 0,
      },
    },
    data() {
      return {
        activeChips: pickRandomQuickChips(this.count),
      };
    },
    computed: {
      ...mapState(['locale', 'preferenceRevision']),
      localizedChips() {
        void this.preferenceRevision;
        return this.activeChips.map((chip) => ({
          ...chip,
          label: translate(this.locale, chip.labelKey),
          prompt: translate(this.locale, chip.promptKey),
        }));
      },
    },
    watch: {
      refreshToken() {
        this.refreshChips();
      },
      count(val) {
        this.activeChips = pickRandomQuickChips(val);
      },
      preferenceRevision() {
        this.refreshChips();
      },
    },
    mounted() {
      this.refreshChips();
    },
    methods: {
      refreshChips() {
        this.activeChips = pickRandomQuickChips(this.count);
      },
      onChipClick(item) {
        this.$emit('select', item.prompt);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .quick-chips {
    flex-shrink: 0;
    width: 100%;
    white-space: nowrap;
  }

  .quick-chips__inner {
    display: inline-flex;
    padding: $spacing-sm $spacing-lg;
    gap: $spacing-sm;
  }

  .quick-chips__item {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    padding: $spacing-sm $spacing-md;
    border-radius: 40rpx;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
    gap: $spacing-xs;
  }

  .quick-chips__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 44rpx;
    height: 44rpx;
    border-radius: $radius-circle;
  }

  .quick-chips__text {
    color: $color-text-primary;
    font-size: $font-size-sm;
    white-space: nowrap;
  }
</style>
