<template>
  <u-popup :show="show" mode="bottom" round="16" @close="onClose">
    <view class="attachment-picker">
      <view class="attachment-picker__grid">
        <view
          v-for="item in options"
          :key="item.key"
          class="attachment-picker__item"
          :class="{ 'attachment-picker__item--disabled': item.disabled }"
          @click="onSelect(item)"
        >
          <view class="attachment-picker__icon" :style="{ backgroundColor: item.iconBg }">
            <u-icon :name="item.icon" :color="item.iconColor" size="24" />
          </view>
          <text class="attachment-picker__label">{{ item.label }}</text>
        </view>
      </view>
      <view
        class="attachment-picker__cancel"
        :style="{ paddingBottom: safeBottom + 'px' }"
        @click="onClose"
      >
        <text class="attachment-picker__cancel-text">取消</text>
      </view>
    </view>
  </u-popup>
</template>

<script>
  import { getSafeAreaBottom } from '@/utils/system.js';
  import { chooseImageFromAlbum, chooseImageFromCamera } from '@/utils/attachment.js';

  const OPTIONS = [
    {
      key: 'camera',
      label: '相机',
      icon: 'camera-fill',
      iconColor: '#0984E3',
      iconBg: 'rgba(9, 132, 227, 0.12)',
      disabled: true,
    },
    {
      key: 'album',
      label: '相册',
      icon: 'photo-fill',
      iconColor: '#6C5CE7',
      iconBg: 'rgba(108, 92, 231, 0.12)',
      disabled: false,
    },
    {
      key: 'file',
      label: '文件',
      icon: 'folder',
      iconColor: '#00B894',
      iconBg: 'rgba(0, 184, 148, 0.12)',
      disabled: true,
    },
  ];

  export default {
    name: 'AttachmentPicker',
    props: {
      show: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        options: OPTIONS,
        safeBottom: getSafeAreaBottom(),
      };
    },
    methods: {
      onClose() {
        this.$emit('close');
      },
      async onSelect(item) {
        if (item.disabled) {
          uni.showToast({ title: '功能开发中', icon: 'none' });
          return;
        }

        this.onClose();

        try {
          let imagePath = '';
          if (item.key === 'album') {
            imagePath = await chooseImageFromAlbum();
          } else if (item.key === 'camera') {
            imagePath = await chooseImageFromCamera();
          }

          if (imagePath) {
            this.$emit('image', imagePath);
          }
        } catch (err) {
          if (err?.message === 'cancel') return;
          uni.showToast({ title: '选择图片失败', icon: 'none' });
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .attachment-picker {
    padding: $spacing-xl $spacing-lg $spacing-md;
    background-color: $color-bg-card;
  }

  .attachment-picker__grid {
    display: flex;
    justify-content: space-around;
    padding-bottom: $spacing-lg;
  }

  .attachment-picker__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 160rpx;
  }

  .attachment-picker__item--disabled {
    opacity: 0.45;
  }

  .attachment-picker__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 112rpx;
    height: 112rpx;
    border-radius: $radius-card;
  }

  .attachment-picker__label {
    margin-top: $spacing-sm;
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }

  .attachment-picker__cancel {
    padding-top: $spacing-md;
    border-top: 1rpx solid $color-bg-muted;
  }

  .attachment-picker__cancel-text {
    display: block;
    padding: $spacing-md 0;
    color: $color-text-secondary;
    font-size: $font-size-base;
    text-align: center;
  }
</style>
