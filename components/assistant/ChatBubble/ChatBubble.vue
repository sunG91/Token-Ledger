<template>
  <view class="chat-bubble" :class="bubbleClass">
    <view
      v-if="isAssistant && streaming && !hasContent && !hasReasoning"
      class="chat-bubble__thinking"
    >
      <view class="chat-bubble__dot" />
      <view class="chat-bubble__dot" />
      <view class="chat-bubble__dot" />
    </view>
    <view
      v-else-if="isAssistant && streaming && !hasContent && hasReasoning"
      class="chat-bubble__reasoning-wrap"
    >
      <text class="chat-bubble__reasoning" selectable>{{ message.reasoningContent }}</text>
      <text class="chat-bubble__cursor">|</text>
    </view>
    <view v-else-if="isAssistant && streaming" class="chat-bubble__streaming">
      <text class="chat-bubble__text" selectable>{{ message.content }}</text>
      <text class="chat-bubble__cursor">|</text>
    </view>
    <chat-message-content
      v-else-if="isAssistant && hasContent"
      :content="message.content"
      :role="message.role"
    />
    <text v-else class="chat-bubble__text" selectable>{{ message.content }}</text>
    <text v-if="metaText" class="chat-bubble__meta">{{ metaText }}</text>
  </view>
</template>

<script>
  import ChatMessageContent from '@/components/assistant/ChatMessageContent/ChatMessageContent.vue';
  import { formatChatMessageMeta } from '@/utils/chatMessage.js';

  export default {
    name: 'ChatBubble',
    components: {
      ChatMessageContent,
    },
    props: {
      message: {
        type: Object,
        required: true,
      },
      showTokenUsage: {
        type: Boolean,
        default: true,
      },
      streaming: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      isAssistant() {
        return this.message.role === 'assistant';
      },
      hasContent() {
        return String(this.message.content || '').trim().length > 0;
      },
      hasReasoning() {
        return String(this.message.reasoningContent || '').length > 0;
      },
      bubbleClass() {
        return this.message.role === 'user' ? 'chat-bubble--user' : 'chat-bubble--assistant';
      },
      metaText() {
        if (this.streaming || !this.hasContent) {
          return '';
        }
        return formatChatMessageMeta(this.message, this.$store.state.locale, {
          showTokenUsage: this.showTokenUsage,
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .chat-bubble {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    max-width: 88%;
    min-width: 0;
    padding: $spacing-md $spacing-md;
    border-radius: $radius-card;
    overflow: hidden;
  }

  .chat-bubble--assistant {
    align-self: flex-start;
    max-width: 88%;
    border-bottom-left-radius: 8rpx;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
  }

  .chat-bubble--user {
    align-self: flex-end;
    border-bottom-right-radius: 8rpx;
    background-color: rgba(9, 132, 227, 0.12);
  }

  .chat-bubble__thinking {
    display: flex;
    align-items: center;
    min-height: 40rpx;
    gap: 8rpx;
  }

  .chat-bubble__reasoning-wrap {
    display: flex;
    align-items: flex-end;
    width: 100%;
    gap: 4rpx;
  }

  .chat-bubble__reasoning {
    color: $color-text-secondary;
    font-size: $font-size-sm;
    line-height: 1.65;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .chat-bubble__dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: $radius-circle;
    background-color: $color-text-placeholder;
    animation: chat-bubble-dot 1.2s infinite ease-in-out;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }

  .chat-bubble__streaming {
    display: flex;
    align-items: flex-end;
    width: 100%;
    gap: 4rpx;
  }

  .chat-bubble__text {
    color: $color-text-primary;
    font-size: $font-size-base;
    line-height: 1.72;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .chat-bubble__cursor {
    flex-shrink: 0;
    color: $color-secondary;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    line-height: 1.72;
    animation: chat-cursor-blink 1s step-end infinite;
  }

  @keyframes chat-cursor-blink {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0;
    }
  }

  @keyframes chat-bubble-dot {
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

  .chat-bubble__meta {
    align-self: flex-end;
    margin-top: $spacing-sm;
    color: $color-text-placeholder;
    font-size: $font-size-xs;
    line-height: 1.4;
  }
</style>
