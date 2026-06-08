<template>
  <view class="assistant-header" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="assistant-header__bar">
      <view class="assistant-header__side">
        <view v-if="showTabToggle" class="assistant-header__btn" @click="onToggleTab">
          <line-fullscreen-icon
            :mode="toggleIconMode"
            :size="30"
            color="#2D3436"
            :stroke-width="2"
          />
        </view>
        <view v-else-if="showBack" class="assistant-header__btn" @click="onBack">
          <u-icon name="arrow-left" color="#2D3436" size="20" />
        </view>
      </view>
      <view class="assistant-header__center">
        <text class="assistant-header__title">{{ $t('assistant.title') }}</text>
        <view class="assistant-header__model" @click="onModelClick">
          <api-key-avatar v-if="currentModel.item" :item="currentModel.item" :size="36" />
          <text class="assistant-header__model-name">{{ modelDisplayName }}</text>
          <u-icon name="arrow-down-fill" color="#636E72" size="10" />
        </view>
      </view>
      <view class="assistant-header__side assistant-header__side--right">
        <view class="assistant-header__btn" @click="onHistory">
          <text class="assistant-header__history">{{ $t('assistant.history') }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import { mapState } from 'vuex';
  import LineFullscreenIcon from '@/components/base/LineFullscreenIcon/LineFullscreenIcon.vue';
  import { getStatusBarHeight } from '@/utils/system.js';

  export default {
    name: 'AssistantHeader',
    components: {
      LineFullscreenIcon,
    },
    props: {
      currentModel: {
        type: Object,
        required: true,
      },
      showBack: {
        type: Boolean,
        default: false,
      },
      /** 记录 Tab 页：左上角切换 TabBar 显隐 */
      showTabToggle: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        statusBarHeight: getStatusBarHeight(),
      };
    },
    computed: {
      ...mapState(['tabBarVisible', 'preferenceRevision']),
      /** Tab 显示 → 最大化；Tab 隐藏 → 缩小 */
      toggleIconMode() {
        return this.tabBarVisible ? 'expand' : 'shrink';
      },
      modelDisplayName() {
        void this.preferenceRevision;
        if (this.currentModel?.useDefaultIcon) {
          return this.$t('apiKeys.defaultChatModel');
        }
        if (this.currentModel?.empty || !this.currentModel?.alias) {
          return this.$t('assistant.noModelSelected');
        }
        return this.currentModel.alias;
      },
    },
    methods: {
      onBack() {
        uni.navigateBack();
      },
      onToggleTab() {
        const nextVisible = !this.tabBarVisible;
        this.$store.commit('SET_TAB_BAR_VISIBLE', nextVisible);
        this.$emit('tab-bar-toggle', nextVisible);
      },
      onModelClick() {
        this.$emit('model-click');
      },
      onHistory() {
        this.$emit('history-click');
      },
    },
  };
</script>

<style lang="scss" scoped>
  .assistant-header {
    flex-shrink: 0;
    background-color: $color-bg-page;
  }

  .assistant-header__bar {
    display: flex;
    align-items: center;
    height: 88rpx;
    padding: 0 $spacing-sm;
  }

  .assistant-header__side {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: flex-start;
    width: 120rpx;
  }

  .assistant-header__side--right {
    justify-content: flex-end;
  }

  .assistant-header__center {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    min-width: 0;
  }

  .assistant-header__title {
    color: $color-text-primary;
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
  }

  .assistant-header__model {
    display: flex;
    align-items: center;
    max-width: 100%;
    margin-top: 4rpx;
    gap: 6rpx;
  }

  .assistant-header__model-name {
    overflow: hidden;
    max-width: 240rpx;
    color: $color-text-secondary;
    font-size: $font-size-xs;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .assistant-header__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 72rpx;
    height: 72rpx;
    padding: 0 $spacing-sm;
  }

  .assistant-header__history {
    color: $color-secondary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }
</style>
