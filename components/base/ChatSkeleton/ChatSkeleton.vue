<template>
  <view class="chat-skeleton">
    <view class="chat-skeleton__row chat-skeleton__row--left">
      <view class="chat-skeleton__bubble chat-skeleton__bubble--wide skeleton-block" />
    </view>
    <view class="chat-skeleton__row chat-skeleton__row--right">
      <view class="chat-skeleton__bubble chat-skeleton__bubble--narrow skeleton-block" />
    </view>
    <view class="chat-skeleton__row chat-skeleton__row--left">
      <view class="chat-skeleton__bubble chat-skeleton__bubble--medium skeleton-block" />
    </view>
  </view>
</template>

<script>
  export default {
    name: 'ChatSkeleton',
  };
</script>

<style lang="scss" scoped>
  .chat-skeleton {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    width: 100%;
    height: 100%;
    padding: $spacing-md $spacing-lg;
    gap: $spacing-md;
    background-color: $color-bg-page;
  }

  .chat-skeleton__row {
    display: flex;
    width: 100%;
  }

  .chat-skeleton__row--left {
    justify-content: flex-start;
  }

  .chat-skeleton__row--right {
    justify-content: flex-end;
  }

  .chat-skeleton__bubble {
    height: 72rpx;
    border-radius: $radius-card;
  }

  .chat-skeleton__bubble--wide {
    width: 72%;
  }

  .chat-skeleton__bubble--medium {
    width: 58%;
  }

  .chat-skeleton__bubble--narrow {
    width: 42%;
  }
</style>
