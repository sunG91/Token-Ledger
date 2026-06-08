<template>
  <view class="bill-record-item" @click="onClick">
    <platform-icon :platform-id="record.platformId" :size="72" />
    <view class="bill-record-item__info">
      <view class="bill-record-item__title-row">
        <text class="bill-record-item__title">{{ displayTitle }}</text>
        <record-scope-tag :usage-scope="record.usageScope" />
      </view>
      <text class="bill-record-item__time">{{ record.displayTime }}</text>
    </view>
    <view class="bill-record-item__right">
      <text class="bill-record-item__tokens">-{{ formatToken(record.tokenCount) }} token</text>
    </view>
    <u-icon name="arrow-right" color="#DFE6E9" size="14" />
  </view>
</template>

<script>
  import PlatformIcon from '@/components/base/PlatformIcon/PlatformIcon.vue';
  import RecordScopeTag from '@/components/base/RecordScopeTag/RecordScopeTag.vue';
  import { formatToken } from '@/utils/format.js';
  import { getRecordDisplayTitle } from '@/utils/recordDisplay.js';

  export default {
    name: 'BillRecordItem',
    components: {
      PlatformIcon,
      RecordScopeTag,
    },
    props: {
      record: {
        type: Object,
        required: true,
      },
    },
    computed: {
      displayTitle() {
        return getRecordDisplayTitle(this.record);
      },
    },
    methods: {
      formatToken,
      onClick() {
        this.$emit('click', this.record);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .bill-record-item {
    display: flex;
    align-items: center;
    padding: $spacing-md 0;
    border-bottom: 1rpx solid $color-bg-muted;

    &:last-child {
      border-bottom: none;
    }
  }

  .bill-record-item__info {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    margin-left: $spacing-md;
  }

  .bill-record-item__title-row {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: $spacing-xs;
  }

  .bill-record-item__title {
    overflow: hidden;
    flex: 1;
    min-width: 0;
    color: $color-text-primary;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bill-record-item__time {
    margin-top: 6rpx;
    color: $color-text-placeholder;
    font-size: $font-size-sm;
  }

  .bill-record-item__right {
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    align-items: flex-end;
    margin-right: $spacing-sm;
  }

  .bill-record-item__tokens {
    color: $color-danger;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }
</style>
