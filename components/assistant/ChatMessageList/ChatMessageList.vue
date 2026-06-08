<template>
  <view class="chat-message-list-wrap">
    <scroll-view
      class="chat-message-list"
      scroll-y
      :scroll-into-view="scrollIntoView"
      scroll-with-animation
      :show-scrollbar="false"
      refresher-enabled
      :refresher-triggered="historyRefreshing"
      :refresher-background="refresherBackground"
      @refresherrefresh="onRefreshHistory"
      @refresherrestore="onRefresherEnd"
      @refresherabort="onRefresherEnd"
      @scrolltoupper="onScrollToUpper"
    >
      <view class="chat-message-list__inner" :style="innerStyle">
        <view v-if="historyLoading" class="chat-message-list__history-tip">
          <u-loadmore status="loading" :loading-text="$t('assistant.loadingHistory')" />
        </view>
        <view v-else-if="hasMoreHistory" class="chat-message-list__history-tip">
          <text class="chat-message-list__history-text">{{ $t('assistant.pullHistory') }}</text>
        </view>
        <view
          v-else-if="showHistoryNoMore && messages.length"
          class="chat-message-list__history-tip"
        >
          <u-loadmore status="nomore" :nomore-text="$t('assistant.historyNoMore')" />
        </view>

        <view
          v-for="message in messages"
          :id="'msg-' + message.id"
          :key="message.id"
          class="chat-message-list__item"
          :class="itemClass(message)"
        >
          <chat-bubble
            v-if="message.type === 'text'"
            :message="message"
            :show-token-usage="showTokenUsage"
            :streaming="message.id === streamingMessageId"
          />
          <image-bubble v-else-if="message.type === 'image'" :message="message" />
          <usage-card
            v-else-if="message.type === 'usage_card'"
            :card="message.card"
            :display-time="message.displayTime"
            @detail="onCardAction('detail', $event)"
            @export="onCardAction('export', $event)"
          />
          <record-card
            v-else-if="message.type === 'record_card'"
            :card="message.card"
            :display-time="message.displayTime"
          />
          <report-card
            v-else-if="message.type === 'report_card'"
            :card="message.card"
            :display-time="message.displayTime"
            @share="onCardAction('share', $event)"
            @detail="onCardAction('detail', $event)"
          />
          <ranking-card
            v-else-if="message.type === 'ranking_card'"
            :card="message.card"
            :display-time="message.displayTime"
          />
        </view>

        <view v-if="typing && !streamingMessageId" class="chat-message-list__typing">
          <view class="chat-message-list__typing-bubble">
            <view class="chat-message-list__dot" />
            <view class="chat-message-list__dot" />
            <view class="chat-message-list__dot" />
          </view>
        </view>

        <view id="msg-bottom-anchor" class="chat-message-list__anchor" />
      </view>
    </scroll-view>
  </view>
</template>

<script>
  import ChatBubble from '@/components/assistant/ChatBubble/ChatBubble.vue';
  import ImageBubble from '@/components/assistant/ImageBubble/ImageBubble.vue';
  import UsageCard from '@/components/assistant/UsageCard/UsageCard.vue';
  import RecordCard from '@/components/assistant/RecordCard/RecordCard.vue';
  import ReportCard from '@/components/assistant/ReportCard/ReportCard.vue';
  import RankingCard from '@/components/assistant/RankingCard/RankingCard.vue';
  import { mapGetters } from 'vuex';

  export default {
    name: 'ChatMessageList',
    components: {
      ChatBubble,
      ImageBubble,
      UsageCard,
      RecordCard,
      ReportCard,
      RankingCard,
    },
    props: {
      messages: {
        type: Array,
        default: () => [],
      },
      typing: {
        type: Boolean,
        default: false,
      },
      hasMoreHistory: {
        type: Boolean,
        default: false,
      },
      showHistoryNoMore: {
        type: Boolean,
        default: false,
      },
      historyLoading: {
        type: Boolean,
        default: false,
      },
      historyRefreshing: {
        type: Boolean,
        default: false,
      },
      showTokenUsage: {
        type: Boolean,
        default: true,
      },
      autoScrollBottom: {
        type: Boolean,
        default: true,
      },
      contentBottomInset: {
        type: Number,
        default: 0,
      },
      streamingMessageId: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        scrollIntoView: '',
      };
    },
    computed: {
      ...mapGetters(['themePalette']),
      refresherBackground() {
        return this.themePalette?.pageBg || '#f8f9fe';
      },
      innerStyle() {
        const inset = Math.max(Number(this.contentBottomInset) || 0, 0);
        if (!inset) {
          return {};
        }
        return {
          paddingBottom: `${inset}px`,
        };
      },
    },
    watch: {
      messages: {
        handler(newVal, oldVal) {
          if (!this.autoScrollBottom) {
            return;
          }
          const oldLastId = oldVal?.[oldVal.length - 1]?.id;
          const newLastId = newVal?.[newVal.length - 1]?.id;
          const appended = !oldVal?.length || newLastId !== oldLastId;
          if (appended) {
            this.scrollToBottom();
          }
        },
        deep: true,
      },
      typing(val) {
        if (val && this.autoScrollBottom) {
          this.scrollToBottom();
        }
      },
    },
    mounted() {
      this.scrollToBottom();
    },
    methods: {
      itemClass(message) {
        if (message.type === 'text' && message.role === 'assistant') {
          return 'chat-message-list__item--assistant';
        }
        if (message.type === 'image' || message.role === 'user') {
          return 'chat-message-list__item--user';
        }
        return 'chat-message-list__item--card';
      },
      scrollToBottom() {
        this.$nextTick(() => {
          this.scrollIntoView = '';
          setTimeout(() => {
            this.scrollIntoView = 'msg-bottom-anchor';
          }, 50);
        });
      },
      scrollToMessage(messageId) {
        if (!messageId) {
          return;
        }
        this.$nextTick(() => {
          this.scrollIntoView = '';
          setTimeout(() => {
            this.scrollIntoView = `msg-${messageId}`;
          }, 50);
        });
      },
      onRefreshHistory() {
        this.$emit('load-history', { fromRefresher: true });
      },
      onRefresherEnd() {
        this.$emit('refresh-end');
      },
      onScrollToUpper() {
        if (this.hasMoreHistory && !this.historyLoading) {
          this.$emit('load-history', { fromRefresher: false });
        }
      },
      onCardAction(action, payload) {
        this.$emit('card-action', { action, payload });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .chat-message-list-wrap {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .chat-message-list {
    width: 100%;
    height: 100%;
    background-color: $color-bg-page;
  }

  .chat-message-list__inner {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    padding: $spacing-md $spacing-lg;
    overflow-x: hidden;
  }

  .chat-message-list__history-tip {
    display: flex;
    justify-content: center;
    padding-bottom: $spacing-sm;
  }

  .chat-message-list__history-text {
    color: $color-text-placeholder;
    font-size: $font-size-xs;
  }

  .chat-message-list__item {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    margin-bottom: $spacing-md;
    overflow: hidden;
  }

  .chat-message-list__item--user {
    align-items: flex-end;
  }

  .chat-message-list__item--assistant,
  .chat-message-list__item--card {
    align-items: flex-start;
    width: 100%;
    max-width: 100%;
  }

  .chat-message-list__typing {
    display: flex;
    align-items: flex-start;
    margin-bottom: $spacing-md;
  }

  .chat-message-list__typing-bubble {
    display: flex;
    align-items: center;
    padding: $spacing-md $spacing-lg;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
    gap: 8rpx;
  }

  .chat-message-list__dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: $radius-circle;
    background-color: $color-text-placeholder;
    animation: chat-dot 1.2s infinite ease-in-out;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }

  .chat-message-list__anchor {
    flex-shrink: 0;
    height: 2rpx;
  }

  @keyframes chat-dot {
    0%,
    80%,
    100% {
      opacity: 0.3;
      transform: scale(0.8);
    }

    40% {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
