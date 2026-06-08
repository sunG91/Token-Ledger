<template>
  <view class="recent-item" @click="onClick">
    <platform-icon :platform-id="record.platformId" />
    <view class="recent-item__info">
      <view class="recent-item__title-row">
        <text class="recent-item__name">{{ displayName }}</text>
        <record-scope-tag :usage-scope="record.usageScope" />
      </view>
      <text class="recent-item__tokens">-{{ formatToken(record.tokenCount) }} token</text>
    </view>
    <text class="recent-item__time">{{ record.displayTime }}</text>
  </view>
</template>

<script>
  import PlatformIcon from '@/components/base/PlatformIcon/PlatformIcon.vue';
  import RecordScopeTag from '@/components/base/RecordScopeTag/RecordScopeTag.vue';
  import { formatToken } from '@/utils/format.js';
  import { getRecordDisplayTitle } from '@/utils/recordDisplay.js';

  export default {
    name: 'RecentListItem',
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
      displayName() {
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
  .recent-item {
    display: flex;
    align-items: center;
    padding: $spacing-md $spacing-md;
    border-bottom: 1rpx solid $color-bg-muted;

    &:last-child {
      border-bottom: none;
    }
  }

  .recent-item__info {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    margin-left: $spacing-md;
  }

  .recent-item__title-row {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: $spacing-xs;
  }

  .recent-item__name {
    overflow: hidden;
    color: $color-text-primary;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .recent-item__tokens {
    margin-top: 6rpx;
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }

  .recent-item__time {
    flex-shrink: 0;
    color: $color-text-placeholder;
    font-size: $font-size-sm;
  }
</style>
