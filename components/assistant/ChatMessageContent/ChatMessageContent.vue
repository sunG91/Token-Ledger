<template>
  <view class="chat-message-content">
    <view
      v-for="(block, index) in blocks"
      :key="index"
      class="chat-message-content__block"
      :class="blockClass(block)"
    >
      <text v-if="block.type === 'code'" class="chat-message-content__code-block" selectable>{{
        block.text
      }}</text>

      <text
        v-else-if="block.type === 'heading'"
        class="chat-message-content__heading"
        :class="'chat-message-content__heading--' + block.level"
        selectable
      >
        <text
          v-for="(segment, segIndex) in block.segments"
          :key="segIndex"
          :class="segmentClass(segment)"
          @click="onSegmentClick(segment)"
          >{{ segment.text }}</text
        >
      </text>

      <view v-else-if="block.type === 'list'" class="chat-message-content__list">
        <view
          v-for="(item, itemIndex) in block.items"
          :key="itemIndex"
          class="chat-message-content__list-item"
        >
          <text class="chat-message-content__list-marker">
            {{ block.ordered ? itemIndex + 1 + '.' : '•' }}
          </text>
          <text class="chat-message-content__list-text" selectable>
            <text
              v-for="(segment, segIndex) in item"
              :key="segIndex"
              :class="segmentClass(segment)"
              @click="onSegmentClick(segment)"
              >{{ segment.text }}</text
            >
          </text>
        </view>
      </view>

      <text
        v-else-if="block.type === 'blockquote'"
        class="chat-message-content__blockquote"
        selectable
      >
        <text
          v-for="(segment, segIndex) in block.segments"
          :key="segIndex"
          :class="segmentClass(segment)"
          @click="onSegmentClick(segment)"
          >{{ segment.text }}</text
        >
      </text>

      <scroll-view
        v-else-if="block.type === 'table'"
        class="chat-message-content__table-scroll"
        scroll-x
        :show-scrollbar="false"
      >
        <view class="chat-message-content__table">
          <view class="chat-message-content__table-row chat-message-content__table-row--head">
            <view
              v-for="(cell, cellIndex) in block.headers"
              :key="'h-' + cellIndex"
              class="chat-message-content__table-cell chat-message-content__table-cell--head"
            >
              <text class="chat-message-content__table-cell-text" selectable>
                <text
                  v-for="(segment, segIndex) in cell"
                  :key="segIndex"
                  :class="segmentClass(segment)"
                  @click="onSegmentClick(segment)"
                  >{{ segment.text }}</text
                >
              </text>
            </view>
          </view>
          <view
            v-for="(row, rowIndex) in block.rows"
            :key="'r-' + rowIndex"
            class="chat-message-content__table-row"
          >
            <view
              v-for="(cell, cellIndex) in row"
              :key="'c-' + rowIndex + '-' + cellIndex"
              class="chat-message-content__table-cell"
            >
              <text class="chat-message-content__table-cell-text" selectable>
                <text
                  v-for="(segment, segIndex) in cell"
                  :key="segIndex"
                  :class="segmentClass(segment)"
                  @click="onSegmentClick(segment)"
                  >{{ segment.text }}</text
                >
              </text>
            </view>
          </view>
        </view>
      </scroll-view>

      <text v-else class="chat-message-content__paragraph" selectable>
        <text
          v-for="(segment, segIndex) in block.segments"
          :key="segIndex"
          :class="segmentClass(segment)"
          @click="onSegmentClick(segment)"
          >{{ segment.text }}</text
        >
      </text>
    </view>
  </view>
</template>

<script>
  import { parseChatContentBlocks } from '@/utils/chatContent.js';

  export default {
    name: 'ChatMessageContent',
    props: {
      content: {
        type: String,
        default: '',
      },
      role: {
        type: String,
        default: 'assistant',
      },
    },
    computed: {
      blocks() {
        return parseChatContentBlocks(this.content);
      },
    },
    methods: {
      blockClass(block = {}) {
        return `chat-message-content__block--${block.type || 'paragraph'}`;
      },
      segmentClass(segment = {}) {
        const map = {
          code: 'chat-message-content__inline-code',
          bold: 'chat-message-content__bold',
          italic: 'chat-message-content__italic',
          link: 'chat-message-content__link',
        };
        return map[segment.type] || 'chat-message-content__plain';
      },
      onSegmentClick(segment = {}) {
        if (segment.type !== 'link' || !segment.href) {
          return;
        }
        const url = String(segment.href).trim();
        if (typeof plus !== 'undefined' && plus.runtime?.openURL) {
          plus.runtime.openURL(url);
          return;
        }
        uni.setClipboardData({
          data: url,
          success: () => {
            uni.showToast({ title: this.$t('assistant.linkCopied'), icon: 'none' });
          },
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .chat-message-content {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow: hidden;
    gap: $spacing-sm;
  }

  .chat-message-content__block--table {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow: hidden;
  }

  .chat-message-content__block--paragraph + .chat-message-content__block--paragraph,
  .chat-message-content__block--heading + .chat-message-content__block--paragraph {
    margin-top: 2rpx;
  }

  .chat-message-content__paragraph,
  .chat-message-content__heading,
  .chat-message-content__blockquote,
  .chat-message-content__list-text {
    color: $color-text-primary;
    font-size: $font-size-base;
    line-height: 1.72;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .chat-message-content__heading--1 {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
  }

  .chat-message-content__heading--2 {
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
  }

  .chat-message-content__heading--3,
  .chat-message-content__heading--4,
  .chat-message-content__heading--5,
  .chat-message-content__heading--6 {
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
  }

  .chat-message-content__blockquote {
    padding-left: $spacing-md;
    border-left: 6rpx solid rgba(108, 92, 231, 0.35);
    color: $color-text-secondary;
  }

  .chat-message-content__list {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  .chat-message-content__list-item {
    display: flex;
    align-items: flex-start;
    gap: $spacing-xs;
  }

  .chat-message-content__list-marker {
    flex-shrink: 0;
    width: 28rpx;
    color: $color-text-secondary;
    font-size: $font-size-base;
    line-height: 1.72;
  }

  .chat-message-content__plain {
    color: inherit;
    font-size: inherit;
    line-height: inherit;
  }

  .chat-message-content__bold {
    color: inherit;
    font-size: inherit;
    font-weight: $font-weight-semibold;
    line-height: inherit;
  }

  .chat-message-content__italic {
    color: inherit;
    font-size: inherit;
    font-style: italic;
    line-height: inherit;
  }

  .chat-message-content__link {
    color: $color-secondary;
    font-size: inherit;
    line-height: inherit;
    text-decoration: underline;
  }

  .chat-message-content__inline-code {
    padding: 2rpx 10rpx;
    border-radius: $radius-tag;
    background-color: rgba(108, 92, 231, 0.1);
    color: $color-primary;
    font-family: monospace;
    font-size: $font-size-sm;
    line-height: 1.5;
    word-break: break-all;
  }

  .chat-message-content__code-block {
    display: block;
    width: 100%;
    padding: $spacing-sm $spacing-md;
    border-radius: $radius-tag;
    background-color: $color-bg-muted;
    color: $color-text-primary;
    font-family: monospace;
    font-size: $font-size-sm;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .chat-message-content__table-scroll {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow: hidden;
  }

  .chat-message-content__table {
    display: inline-flex;
    flex-direction: column;
    border: 1rpx solid $color-bg-muted;
    border-radius: $radius-tag;
    background-color: $color-bg-card;
  }

  .chat-message-content__table-row {
    display: flex;
    flex-direction: row;
    border-bottom: 1rpx solid $color-bg-muted;

    &:last-child {
      border-bottom: none;
    }
  }

  .chat-message-content__table-row--head {
    background-color: rgba(108, 92, 231, 0.08);
  }

  .chat-message-content__table-cell {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    min-width: 160rpx;
    max-width: 360rpx;
    padding: $spacing-sm $spacing-md;
    border-right: 1rpx solid $color-bg-muted;

    &:last-child {
      border-right: none;
    }
  }

  .chat-message-content__table-cell--head {
    min-width: 140rpx;
  }

  .chat-message-content__table-cell-text {
    color: $color-text-primary;
    font-size: $font-size-sm;
    line-height: 1.5;
    white-space: nowrap;
  }

  .chat-message-content__table-row--head .chat-message-content__table-cell-text {
    font-weight: $font-weight-medium;
  }
</style>
