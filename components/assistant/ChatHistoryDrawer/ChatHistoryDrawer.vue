<template>
  <u-popup :show="show" mode="left" :custom-style="panelStyle" @close="onClose">
    <view class="chat-history" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="chat-history__header">
        <text class="chat-history__title">{{ $t('assistant.historyTitle') }}</text>
        <view class="chat-history__close" @click="onClose">
          <u-icon name="close" color="#636E72" size="18" />
        </view>
      </view>

      <view class="chat-history__new" @click="onNewChat">
        <u-icon name="plus" color="#FFFFFF" size="16" />
        <text class="chat-history__new-text">{{ $t('assistant.newChat') }}</text>
      </view>

      <scroll-view
        class="chat-history__list"
        scroll-y
        :style="{ height: listHeight + 'px' }"
        :lower-threshold="80"
        @scrolltolower="onLoadMoreSessions"
      >
        <view class="chat-history__list-inner">
          <view v-if="sessionTotal" class="chat-history__section-row">
            <text class="chat-history__section">{{ $t('assistant.historySection') }}</text>
            <text class="chat-history__count">{{
              $t('assistant.historySessionCount', { count: sessionTotal })
            }}</text>
          </view>

          <view v-if="!sessionTotal" class="chat-history__empty">
            <view class="chat-history__empty-icon">
              <u-icon name="chat" color="#B2BEC3" size="28" />
            </view>
            <text class="chat-history__empty-text">{{ $t('assistant.historyEmpty') }}</text>
          </view>

          <view
            v-for="item in visibleSessions"
            :key="item.id"
            class="chat-history__item"
            :class="{ 'chat-history__item--active': item.id === activeId }"
            @click="onSelect(item)"
          >
            <view class="chat-history__item-body">
              <view class="chat-history__item-leading">
                <u-icon
                  name="chat-fill"
                  :color="item.id === activeId ? '#0984E3' : '#636E72'"
                  size="18"
                />
              </view>
              <view class="chat-history__item-main">
                <text class="chat-history__item-title">{{
                  item.title || $t('assistant.newChat')
                }}</text>
                <view class="chat-history__item-meta-row">
                  <text v-if="formatMessageCount(item)" class="chat-history__item-count">
                    {{ formatMessageCount(item) }}
                  </text>
                  <text v-if="getSessionTokens(item)" class="chat-history__item-token">
                    {{ formatSessionTokens(item) }}
                  </text>
                  <text class="chat-history__item-date">{{ formatSessionDate(item) }}</text>
                </view>
              </view>
              <view class="chat-history__delete" @click.stop="onDelete(item)">
                <u-icon name="trash" color="#B2BEC3" size="16" />
              </view>
            </view>
          </view>

          <view v-if="sessionLoading && visibleSessions.length" class="chat-history__footer-tip">
            <u-loadmore status="loading" />
          </view>
          <view
            v-else-if="sessionFinished && visibleSessions.length"
            class="chat-history__footer-tip"
          >
            <u-loadmore status="nomore" :nomore-text="$t('list.noMore')" />
          </view>
        </view>
      </scroll-view>

      <view class="chat-history__footer" :style="{ paddingBottom: safeBottom + 'px' }">
        <text class="chat-history__hint">{{ $t('assistant.historyHint') }}</text>
      </view>
    </view>
  </u-popup>
</template>

<script>
  import dayjs from 'dayjs';
  import { CHAT_SESSION_PAGE_SIZE } from '@/constants/chat.js';
  import {
    getSafeAreaBottom,
    getStatusBarHeight,
    getWindowHeight,
    getWindowWidth,
  } from '@/utils/system.js';

  export default {
    name: 'ChatHistoryDrawer',
    props: {
      show: {
        type: Boolean,
        default: false,
      },
      sessions: {
        type: Array,
        default: () => [],
      },
      activeId: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        statusBarHeight: getStatusBarHeight(),
        safeBottom: getSafeAreaBottom(),
        sessionPage: 1,
        sessionLoading: false,
      };
    },
    computed: {
      panelStyle() {
        const widthPx = Math.max(Math.floor(getWindowWidth() * 0.88), 300);
        return {
          width: `${widthPx}px`,
          height: '100%',
        };
      },
      listHeight() {
        const reserved = this.statusBarHeight + this.safeBottom + uni.upx2px(300);
        return Math.max(Math.floor(getWindowHeight() - reserved), 200);
      },
      sessionTotal() {
        return Array.isArray(this.sessions) ? this.sessions.length : 0;
      },
      visibleSessions() {
        const end = this.sessionPage * CHAT_SESSION_PAGE_SIZE;
        return (this.sessions || []).slice(0, end);
      },
      sessionFinished() {
        return this.visibleSessions.length >= this.sessionTotal;
      },
    },
    watch: {
      show(val) {
        if (val) {
          this.sessionPage = 1;
        }
      },
      sessions() {
        const maxPage = Math.max(1, Math.ceil(this.sessionTotal / CHAT_SESSION_PAGE_SIZE));
        if (this.sessionPage > maxPage) {
          this.sessionPage = maxPage;
        }
      },
    },
    methods: {
      onClose() {
        this.$emit('close');
      },
      onNewChat() {
        this.$emit('new-chat');
      },
      onSelect(item) {
        this.$emit('select', item);
        this.onClose();
      },
      onDelete(item) {
        uni.showModal({
          title: this.$t('assistant.deleteSessionTitle'),
          content: this.$t('assistant.deleteSessionConfirm'),
          confirmColor: '#D63031',
          success: (res) => {
            if (res.confirm) {
              this.$emit('delete', item);
            }
          },
        });
      },
      onLoadMoreSessions() {
        if (this.sessionFinished || this.sessionLoading || !this.sessionTotal) {
          return;
        }
        this.sessionLoading = true;
        this.$nextTick(() => {
          this.sessionPage += 1;
          this.sessionLoading = false;
        });
      },
      getSessionTokens(item = {}) {
        return Number(item.totalTokens) || 0;
      },
      formatSessionTokens(item = {}) {
        const tokens = this.getSessionTokens(item);
        if (!tokens) {
          return '';
        }
        return this.$t('assistant.sessionTokenBadge', { tokens });
      },
      formatMessageCount(item = {}) {
        const count = Number(item.messageCount) || 0;
        if (!count) {
          return '';
        }
        return this.$t('assistant.sessionMessageCount', { count });
      },
      formatSessionDate(item = {}) {
        return dayjs(item.updatedAt || item.createdAt).format('MM-DD HH:mm');
      },
    },
  };
</script>

<style lang="scss" scoped>
  .chat-history {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color: $color-bg-page;
  }

  .chat-history__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md $spacing-lg $spacing-sm;
  }

  .chat-history__title {
    flex: 1;
    min-width: 0;
    color: $color-text-primary;
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
    white-space: nowrap;
  }

  .chat-history__close {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 64rpx;
    height: 64rpx;
    border-radius: $radius-circle;
    background-color: $color-bg-muted;
  }

  .chat-history__new {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 88rpx;
    margin: 0 $spacing-lg $spacing-md;
    padding: 0 $spacing-lg;
    border-radius: 48rpx;
    background-color: $color-secondary;
    box-shadow: $shadow-button;
    gap: $spacing-xs;
  }

  .chat-history__new-text {
    color: $color-text-inverse;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
  }

  .chat-history__list {
    flex: 1;
    width: 100%;
  }

  .chat-history__list-inner {
    padding: 0 $spacing-lg $spacing-md;
  }

  .chat-history__section-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-sm;
    gap: $spacing-sm;
  }

  .chat-history__section {
    color: $color-text-placeholder;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
  }

  .chat-history__count {
    flex-shrink: 0;
    color: $color-text-secondary;
    font-size: $font-size-xs;
  }

  .chat-history__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $spacing-xl $spacing-lg;
    text-align: center;
    gap: $spacing-md;
  }

  .chat-history__empty-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 96rpx;
    height: 96rpx;
    border-radius: $radius-circle;
    background-color: $color-bg-muted;
  }

  .chat-history__empty-text {
    color: $color-text-secondary;
    font-size: $font-size-sm;
    line-height: 1.6;
  }

  .chat-history__item {
    margin-bottom: $spacing-md;
    border-radius: $radius-card;
    overflow: hidden;
  }

  .chat-history__item-body {
    display: flex;
    align-items: center;
    min-height: 112rpx;
    padding: $spacing-md;
    border: 1rpx solid transparent;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
    gap: $spacing-md;
  }

  .chat-history__item--active .chat-history__item-body {
    border-color: rgba(9, 132, 227, 0.22);
    background-color: rgba(9, 132, 227, 0.06);
    box-shadow: 0 4rpx 20rpx rgba(9, 132, 227, 0.08);
  }

  .chat-history__item-leading {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 64rpx;
    height: 64rpx;
    border-radius: 18rpx;
    background-color: $color-bg-muted;
  }

  .chat-history__item--active .chat-history__item-leading {
    background-color: rgba(9, 132, 227, 0.1);
  }

  .chat-history__item-main {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    gap: 8rpx;
  }

  .chat-history__item-title {
    overflow: hidden;
    color: $color-text-primary;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    line-height: 1.4;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chat-history__item-meta-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: $spacing-xs;
  }

  .chat-history__item-count {
    padding: 2rpx 12rpx;
    border-radius: $radius-tag;
    background-color: $color-bg-muted;
    color: $color-text-secondary;
    font-size: $font-size-xs;
    line-height: 1.5;
  }

  .chat-history__item-token {
    padding: 2rpx 12rpx;
    border-radius: $radius-tag;
    background-color: rgba(9, 132, 227, 0.1);
    color: $color-secondary;
    font-size: $font-size-xs;
    line-height: 1.5;
  }

  .chat-history__item-date {
    color: $color-text-placeholder;
    font-size: $font-size-xs;
    line-height: 1.5;
  }

  .chat-history__delete {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 64rpx;
    height: 64rpx;
    border-radius: 16rpx;
    background-color: $color-bg-muted;
  }

  .chat-history__footer-tip {
    padding: $spacing-sm 0 $spacing-md;
  }

  .chat-history__footer {
    padding: $spacing-md $spacing-lg 0;
    border-top: 1rpx solid $color-bg-muted;
    background-color: $color-bg-card;
  }

  .chat-history__hint {
    display: block;
    padding-bottom: $spacing-sm;
    color: $color-text-placeholder;
    font-size: $font-size-xs;
    line-height: 1.6;
    text-align: center;
  }
</style>
