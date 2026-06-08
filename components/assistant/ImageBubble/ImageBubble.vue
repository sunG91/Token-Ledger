<template>
  <view class="image-bubble">
    <image class="image-bubble__img" :src="message.imagePath" mode="widthFix" @click="onPreview" />
    <text v-if="message.displayTime" class="image-bubble__time">{{ message.displayTime }}</text>
  </view>
</template>

<script>
  export default {
    name: 'ImageBubble',
    props: {
      message: {
        type: Object,
        required: true,
      },
    },
    methods: {
      onPreview() {
        uni.previewImage({
          urls: [this.message.imagePath],
          current: this.message.imagePath,
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .image-bubble {
    display: flex;
    flex-direction: column;
    align-self: flex-end;
    max-width: 60%;
  }

  .image-bubble__img {
    width: 320rpx;
    border-radius: $radius-card;
    background-color: $color-bg-muted;
  }

  .image-bubble__time {
    align-self: flex-end;
    margin-top: $spacing-xs;
    color: $color-text-placeholder;
    font-size: $font-size-xs;
  }
</style>
