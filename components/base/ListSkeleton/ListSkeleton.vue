<template>
  <view class="list-skeleton">
    <view v-for="index in count" :key="index" class="list-skeleton__item">
      <view class="list-skeleton__avatar skeleton-block" />
      <view class="list-skeleton__lines">
        <view class="list-skeleton__line list-skeleton__line--title skeleton-block" />
        <view class="list-skeleton__line list-skeleton__line--sub skeleton-block" />
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    name: 'ListSkeleton',
    props: {
      count: {
        type: Number,
        default: 4,
      },
    },
  };
</script>

<style lang="scss" scoped>
  .list-skeleton {
    display: flex;
    flex-direction: column;
    padding: $spacing-md $spacing-lg;
    gap: $spacing-md;
  }

  .list-skeleton__item {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  .list-skeleton__avatar {
    flex-shrink: 0;
    width: 72rpx;
    height: 72rpx;
    border-radius: 20rpx;
  }

  .list-skeleton__lines {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12rpx;
  }

  .list-skeleton__line {
    height: 24rpx;
    border-radius: 12rpx;
  }

  .list-skeleton__line--title {
    width: 46%;
  }

  .list-skeleton__line--sub {
    width: 72%;
  }
</style>
