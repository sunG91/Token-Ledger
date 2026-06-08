<template>
  <view class="usage-card">
    <view class="usage-card__header">
      <platform-icon :platform-id="card.platformId" :size="48" />
      <text class="usage-card__title">{{ card.title }}</text>
    </view>
    <text class="usage-card__tokens">{{ formatToken(card.tokenCount) }} token</text>
    <view class="usage-card__actions">
      <text class="usage-card__link" @click="onDetail">查看详情 ></text>
      <text class="usage-card__link" @click="onExport">导出记录 ></text>
    </view>
    <text class="usage-card__time">{{ displayTime }}</text>
  </view>
</template>

<script>
  import { formatToken } from '@/utils/format.js';

  export default {
    name: 'UsageCard',
    props: {
      card: {
        type: Object,
        required: true,
      },
      displayTime: {
        type: String,
        default: '',
      },
    },
    methods: {
      formatToken,
      onDetail() {
        this.$emit('detail', this.card);
      },
      onExport() {
        this.$emit('export', this.card);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .usage-card {
    display: flex;
    flex-direction: column;
    align-self: flex-start;
    width: 85%;
    padding: $spacing-md $spacing-md;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
  }

  .usage-card__header {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .usage-card__title {
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }

  .usage-card__tokens {
    margin-top: $spacing-sm;
    color: $color-text-primary;
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
  }

  .usage-card__actions {
    display: flex;
    justify-content: space-between;
    margin-top: $spacing-md;
    gap: $spacing-md;
  }

  .usage-card__link {
    color: $color-secondary;
    font-size: $font-size-sm;
  }

  .usage-card__time {
    align-self: flex-end;
    margin-top: $spacing-sm;
    color: $color-text-placeholder;
    font-size: $font-size-xs;
  }
</style>
