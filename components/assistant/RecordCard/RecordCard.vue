<template>
  <view class="record-card">
    <view class="record-card__header">
      <platform-icon :platform-id="card.platformId" :size="48" />
      <view class="record-card__info">
        <text class="record-card__name">{{ card.platformName }}</text>
        <text v-if="card.modelName" class="record-card__model">{{ card.modelName }}</text>
      </view>
      <record-scope-tag :usage-scope="card.usageScope" />
    </view>
    <view class="record-card__body">
      <text class="record-card__tokens">-{{ formatToken(card.tokenCount) }} token</text>
    </view>
    <text class="record-card__time">{{ displayTime }}</text>
  </view>
</template>

<script>
  import RecordScopeTag from '@/components/base/RecordScopeTag/RecordScopeTag.vue';
  import { formatToken } from '@/utils/format.js';

  export default {
    name: 'RecordCard',
    components: {
      RecordScopeTag,
    },
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
    },
  };
</script>

<style lang="scss" scoped>
  .record-card {
    display: flex;
    flex-direction: column;
    align-self: flex-start;
    width: 85%;
    padding: $spacing-md $spacing-md;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
  }

  .record-card__header {
    display: flex;
    align-items: center;
  }

  .record-card__info {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    margin-left: $spacing-sm;
  }

  .record-card__name {
    color: $color-text-primary;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
  }

  .record-card__model {
    margin-top: 4rpx;
    color: $color-text-secondary;
    font-size: $font-size-xs;
  }

  .record-card__body {
    display: flex;
    align-items: baseline;
    margin-top: $spacing-md;
    gap: $spacing-sm;
  }

  .record-card__tokens {
    color: $color-text-primary;
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
  }

  .record-card__time {
    align-self: flex-end;
    margin-top: $spacing-sm;
    color: $color-text-placeholder;
    font-size: $font-size-xs;
  }
</style>
