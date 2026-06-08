<template>
  <text class="record-scope-tag" :class="scopeClass">{{ scopeLabel }}</text>
</template>

<script>
  import { RECORD_USAGE_SCOPE } from '@/constants/bookkeeping.js';
  import { getRecordScopeI18nKey } from '@/utils/recordDisplay.js';

  export default {
    name: 'RecordScopeTag',
    props: {
      usageScope: {
        type: String,
        default: RECORD_USAGE_SCOPE.EXTERNAL,
      },
    },
    computed: {
      scopeClass() {
        return {
          'record-scope-tag--internal': this.usageScope === RECORD_USAGE_SCOPE.INTERNAL,
          'record-scope-tag--external': this.usageScope !== RECORD_USAGE_SCOPE.INTERNAL,
        };
      },
      scopeLabel() {
        void this.$store.state.preferenceRevision;
        return this.$t(getRecordScopeI18nKey(this.usageScope));
      },
    },
  };
</script>

<style lang="scss" scoped>
  .record-scope-tag {
    flex-shrink: 0;
    padding: 2rpx 10rpx;
    border-radius: $radius-tag;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    line-height: 1.4;
  }

  .record-scope-tag--internal {
    color: $color-primary;
    background-color: rgba(108, 92, 231, 0.12);
  }

  .record-scope-tag--external {
    color: $color-secondary;
    background-color: rgba(9, 132, 227, 0.1);
  }
</style>
