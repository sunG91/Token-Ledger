<template>
  <view class="assistant-chat">
    <view class="assistant-chat__header">
      <assistant-header
        :current-model="currentModel"
        :show-back="showBack"
        :show-tab-toggle="withTabBar && recordExpandEnabled"
        @model-click="showModelPicker = true"
        @history-click="onHistory"
        @tab-bar-toggle="onTabBarToggle"
      />
    </view>

    <view class="assistant-chat__body" :style="bodyAreaStyle">
      <chat-skeleton v-if="initialLoading" />
      <chat-message-list
        v-else
        ref="messageList"
        :messages="messages"
        :content-bottom-inset="messageBottomInset"
        :typing="listTyping"
        :has-more-history="historyHasMore"
        :show-history-no-more="historyPullAttempted && !historyHasMore"
        :history-loading="historyLoading"
        :history-refreshing="historyRefreshing"
        :auto-scroll-bottom="autoScrollBottom"
        :streaming-message-id="streamingMessageId"
        :show-token-usage="showChatTokenUsage"
        @load-history="onLoadHistory"
        @refresh-end="onHistoryRefreshEnd"
        @card-action="onCardAction"
      />
    </view>

    <view
      class="assistant-chat__footer"
      :class="{ 'assistant-chat__footer--tab': withTabBar && tabBarVisible }"
    >
      <quick-chips :refresh-token="chipRefreshToken" @select="onQuickChip" />
      <chat-input-bar
        :value="inputText"
        :disabled="sending || initialLoading"
        :safe-bottom="false"
        :extra-bottom="inputBottomInset"
        :show-media-actions="!isLocalMode"
        @input="inputText = $event"
        @send="onSend"
        @attach="onAttach"
      />
    </view>

    <attachment-picker
      v-if="!isLocalMode"
      :show="showAttachmentPicker"
      @close="showAttachmentPicker = false"
      @image="onImageSelected"
    />

    <model-picker
      :show="showModelPicker"
      :models="boundModels"
      :current-id="currentModel.id"
      @close="showModelPicker = false"
      @select="onModelSelect"
    />

    <chat-history-drawer
      :show="showHistoryDrawer"
      :sessions="chatSessions"
      :active-id="sessionId"
      @close="showHistoryDrawer = false"
      @select="onSelectSession"
      @new-chat="onNewChat"
      @delete="onDeleteSession"
    />
  </view>
</template>

<script>
  import AssistantHeader from '@/components/assistant/AssistantHeader/AssistantHeader.vue';
  import ChatMessageList from '@/components/assistant/ChatMessageList/ChatMessageList.vue';
  import ChatSkeleton from '@/components/base/ChatSkeleton/ChatSkeleton.vue';
  import QuickChips from '@/components/assistant/QuickChips/QuickChips.vue';
  import ChatInputBar from '@/components/assistant/ChatInputBar/ChatInputBar.vue';
  import AttachmentPicker from '@/components/assistant/AttachmentPicker/AttachmentPicker.vue';
  import ModelPicker from '@/components/assistant/ModelPicker/ModelPicker.vue';
  import ChatHistoryDrawer from '@/components/assistant/ChatHistoryDrawer/ChatHistoryDrawer.vue';
  import { fetchBoundModels } from '@/api/boundModels.js';
  import { sendChatMessage } from '@/api/assistant.js';
  import {
    fetchChatSessions,
    loadOlderSessionMessages,
    persistChatMessages,
    removeChatSession,
    resolveInitialChatState,
    startNewChatSession,
    switchChatSession,
  } from '@/api/chatSessions.js';
  import { sliceVisibleMessages } from '@/utils/chatMessageWindow.js';
  import { verifyStorageWritable } from '@/utils/storage.js';
  import { getWelcomeMessages } from '@/constants/mock/assistant.js';
  import { createEmptyBoundModel, syncBoundModelSelection } from '@/utils/boundModels.js';
  import { createImageMessage, createTextMessage } from '@/utils/chatMessage.js';
  import { DATA_MODES } from '@/constants/appMode.js';
  import { getSafeAreaBottom } from '@/utils/system.js';
  import { mapState } from 'vuex';

  const EST_HEADER_PX = () => uni.upx2px(96);
  const EST_FOOTER_PX = () => uni.upx2px(280);

  export default {
    name: 'AssistantChat',
    components: {
      AssistantHeader,
      ChatMessageList,
      ChatSkeleton,
      QuickChips,
      ChatInputBar,
      AttachmentPicker,
      ModelPicker,
      ChatHistoryDrawer,
    },
    props: {
      showBack: {
        type: Boolean,
        default: false,
      },
      withTabBar: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        boundModels: [],
        currentModel: createEmptyBoundModel(),
        allMessages: [],
        firstLoadedIndex: 0,
        historyHasMore: false,
        historyPullAttempted: false,
        historyLoading: false,
        historyRefreshing: false,
        chatSessions: [],
        inputText: '',
        sessionId: '',
        sending: false,
        initialLoading: true,
        showModelPicker: false,
        showAttachmentPicker: false,
        showHistoryDrawer: false,
        chipRefreshToken: 0,
        headerHeight: EST_HEADER_PX(),
        footerHeight: EST_FOOTER_PX(),
        streamingMessageId: '',
        scrollPending: false,
        streamContentQueue: [],
        streamReasoningQueue: [],
        streamFlushRaf: null,
        streamAssistantIndex: -1,
        receivedStreamChunk: false,
      };
    },
    computed: {
      ...mapState(['tabBarVisible', 'recordExpandEnabled', 'dataMode']),
      messages() {
        return sliceVisibleMessages(this.allMessages, this.firstLoadedIndex);
      },
      autoScrollBottom() {
        return !this.historyLoading;
      },
      listTyping() {
        return this.sending && !this.streamingMessageId;
      },
      isLocalMode() {
        return this.dataMode === DATA_MODES.LOCAL;
      },
      showChatTokenUsage() {
        if (this.isLocalMode) {
          return true;
        }
        return !this.currentModel?.useDefaultIcon;
      },
      messageBottomInset() {
        return uni.upx2px(16);
      },
      bodyAreaStyle() {
        return {
          top: `${this.headerHeight}px`,
          bottom: `${this.footerHeight}px`,
        };
      },
      inputBottomInset() {
        if (!this.withTabBar) return 0;
        if (!this.tabBarVisible) {
          return getSafeAreaBottom() + uni.upx2px(16);
        }
        return uni.upx2px(8);
      },
    },
    watch: {
      tabBarVisible() {
        this.scheduleLayout();
        this.$nextTick(() => this.scrollToBottom());
      },
      initialLoading(val) {
        if (!val) {
          this.scheduleLayout();
        }
      },
      chipRefreshToken() {
        this.scheduleLayout();
      },
    },
    mounted() {
      uni.onWindowResize(this.scheduleLayout);
      uni.$on('app-locale-changed', this.onLocaleChanged);
      this.scheduleLayout();
      this.initChat();
      this.loadBoundModels();
    },
    beforeDestroy() {
      uni.offWindowResize(this.scheduleLayout);
      uni.$off('app-locale-changed', this.onLocaleChanged);
    },
    methods: {
      scheduleLayout() {
        this.$nextTick(() => {
          this.measureLayout();
          setTimeout(() => this.measureLayout(), 80);
          setTimeout(() => this.measureLayout(), 240);
        });
      },
      measureLayout() {
        const query = uni.createSelectorQuery().in(this);
        query.select('.assistant-chat__header').boundingClientRect();
        query.select('.assistant-chat__footer').boundingClientRect();
        query.exec((rects) => {
          if (rects[0]?.height) {
            this.headerHeight = Math.floor(rects[0].height);
          }
          if (rects[1]?.height) {
            this.footerHeight = Math.floor(rects[1].height);
          }
        });
      },
      refreshChips() {
        this.chipRefreshToken += 1;
      },
      async refreshChatSessions() {
        this.chatSessions = await fetchChatSessions();
      },
      async loadBoundModels() {
        try {
          const models = await fetchBoundModels();
          this.boundModels = models;
          this.currentModel = syncBoundModelSelection(models, this.currentModel);
        } catch {
          this.boundModels = [];
          this.currentModel = createEmptyBoundModel();
        }
      },
      refreshBoundModels() {
        return this.loadBoundModels();
      },
      onLocaleChanged() {
        this.refreshBoundModels();
        this.refreshChips();
        this.refreshWelcomeMessage();
      },
      refreshWelcomeMessage() {
        if (this.initialLoading || !this.allMessages.length) {
          return;
        }
        const hasUserMessage = this.allMessages.some((item) => item.role === 'user');
        if (
          !hasUserMessage &&
          this.allMessages.length === 1 &&
          this.allMessages[0].role === 'assistant'
        ) {
          const [welcome] = getWelcomeMessages(this.$store.state.locale);
          this.$set(this.allMessages, 0, welcome);
          this.persistMessages();
        }
      },
      applySessionState(res = {}) {
        this.sessionId = res.sessionId || '';
        this.allMessages = Array.isArray(res.allMessages) ? res.allMessages : res.items || [];
        this.firstLoadedIndex = Number(res.firstLoadedIndex) || 0;
        this.historyHasMore = !!res.hasMore;
        this.historyPullAttempted = false;
        if (Array.isArray(res.sessions)) {
          this.chatSessions = res.sessions;
        }
      },
      onTabBarToggle() {
        this.scheduleLayout();
        this.$nextTick(() => this.scrollToBottom());
      },
      scrollToBottom() {
        this.$nextTick(() => {
          this.$refs.messageList?.scrollToBottom();
        });
      },
      scheduleScrollToBottom() {
        if (this.scrollPending) {
          return;
        }
        this.scrollPending = true;
        const raf =
          typeof requestAnimationFrame === 'function'
            ? requestAnimationFrame
            : (fn) => setTimeout(fn, 16);
        raf(() => {
          this.scrollPending = false;
          this.scrollToBottom();
        });
      },
      resetStreamQueue() {
        this.streamContentQueue = [];
        this.streamReasoningQueue = [];
        this.streamAssistantIndex = -1;
        if (this.streamFlushRaf) {
          const cancel =
            typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : clearTimeout;
          cancel(this.streamFlushRaf);
          this.streamFlushRaf = null;
        }
      },
      splitStreamDelta(delta = '') {
        const text = String(delta || '');
        if (text.length <= 8) {
          return [text];
        }
        const parts = [];
        for (let i = 0; i < text.length; i += 2) {
          parts.push(text.slice(i, i + 2));
        }
        return parts;
      },
      enqueueStreamPart(type, delta, assistantIndex) {
        if (!delta) {
          return;
        }
        this.streamAssistantIndex = assistantIndex;
        const parts = this.splitStreamDelta(delta);
        if (type === 'content') {
          this.streamContentQueue.push(...parts);
        } else {
          this.streamReasoningQueue.push(...parts);
        }
        this.scheduleStreamFlush();
      },
      drainStreamQueue() {
        return new Promise((resolve) => {
          const check = () => {
            if (
              !this.streamContentQueue.length &&
              !this.streamReasoningQueue.length &&
              !this.streamFlushRaf
            ) {
              resolve();
              return;
            }
            setTimeout(check, 16);
          };
          check();
        });
      },
      scheduleStreamFlush() {
        if (this.streamFlushRaf) {
          return;
        }
        const raf =
          typeof requestAnimationFrame === 'function'
            ? requestAnimationFrame
            : (fn) => setTimeout(fn, 16);
        const tick = () => {
          this.streamFlushRaf = null;
          const assistantIndex = this.streamAssistantIndex;
          if (assistantIndex < 0) {
            return;
          }

          let updated = false;
          const contentDelta = this.streamContentQueue.shift();
          if (contentDelta) {
            const current = this.allMessages[assistantIndex] || {};
            this.$set(this.allMessages, assistantIndex, {
              ...current,
              content: `${current.content || ''}${contentDelta}`,
            });
            updated = true;
          } else {
            const reasoningDelta = this.streamReasoningQueue.shift();
            if (reasoningDelta) {
              const current = this.allMessages[assistantIndex] || {};
              this.$set(this.allMessages, assistantIndex, {
                ...current,
                reasoningContent: `${current.reasoningContent || ''}${reasoningDelta}`,
              });
              updated = true;
            }
          }

          if (updated) {
            this.scheduleScrollToBottom();
          }

          if (this.streamContentQueue.length || this.streamReasoningQueue.length) {
            this.streamFlushRaf = raf(tick);
          }
        };
        this.streamFlushRaf = raf(tick);
      },
      markStreamStarted() {
        if (!this.receivedStreamChunk) {
          this.receivedStreamChunk = true;
          this.sending = false;
        }
      },
      persistMessages() {
        if (!this.sessionId) {
          return;
        }
        const res = persistChatMessages(this.sessionId, this.allMessages);
        if (Array.isArray(res.sessions)) {
          this.chatSessions = res.sessions;
        } else {
          this.refreshChatSessions();
        }
        if (!res.ok) {
          uni.showToast({
            title: this.$t('assistant.storageSaveFailed'),
            icon: 'none',
          });
        }
      },
      onHistoryRefreshEnd() {
        this.historyRefreshing = false;
      },
      endHistoryRefresh(fromRefresher = false) {
        if (!fromRefresher) {
          this.historyRefreshing = false;
          return;
        }
        this.$nextTick(() => {
          setTimeout(() => {
            this.historyRefreshing = false;
          }, 100);
        });
      },
      async onLoadHistory(meta = {}) {
        const fromRefresher = !!meta?.fromRefresher;

        if (fromRefresher) {
          this.historyPullAttempted = true;
          this.historyRefreshing = true;
        }

        if (this.historyLoading) {
          this.endHistoryRefresh(fromRefresher);
          return;
        }

        if (!this.historyHasMore || !this.sessionId) {
          this.endHistoryRefresh(fromRefresher);
          if (fromRefresher) {
            uni.showToast({
              title: this.$t('assistant.historyNoMore'),
              icon: 'none',
              duration: 1500,
            });
          }
          return;
        }

        const anchorId = this.messages[0]?.id || '';
        this.historyLoading = true;
        if (!fromRefresher) {
          this.historyRefreshing = true;
        }

        try {
          this.historyPullAttempted = true;
          const res = await loadOlderSessionMessages(this.sessionId, this.firstLoadedIndex);
          if (!res.loaded) {
            this.historyHasMore = false;
            return;
          }
          this.allMessages = Array.isArray(res.allMessages) ? res.allMessages : this.allMessages;
          this.firstLoadedIndex = Number(res.firstLoadedIndex) || 0;
          this.historyHasMore = !!res.hasMore;
          this.$nextTick(() => {
            this.$refs.messageList?.scrollToMessage(anchorId || res.anchorId);
          });
        } finally {
          this.historyLoading = false;
          this.endHistoryRefresh(fromRefresher);
        }
      },
      async initChat() {
        try {
          await this.loadBoundModels();
          if (!verifyStorageWritable()) {
            uni.showToast({
              title: this.$t('assistant.storageSaveFailed'),
              icon: 'none',
            });
          }
          const res = resolveInitialChatState({
            apiKeyId: this.currentModel.apiKeyId,
          });
          this.applySessionState(res);
          await this.refreshChatSessions();
          this.scrollToBottom();
        } catch {
          // ignore
        } finally {
          this.initialLoading = false;
        }
      },
      async onSend(text) {
        const message = (text || this.inputText).trim();
        if (!message || this.sending || this.initialLoading) return;
        if (!this.currentModel?.apiKeyId || this.currentModel?.isVirtualDefault) {
          const isCloud = this.$store.state.dataMode === DATA_MODES.CLOUD;
          uni.showToast({
            title: isCloud
              ? this.$t('assistant.cloudDefaultReserved')
              : this.$t('assistant.configureChatModel'),
            icon: 'none',
          });
          if (!isCloud) {
            setTimeout(() => {
              uni.navigateTo({ url: '/pages/settings/chat-model' });
            }, 600);
          }
          return;
        }

        this.inputText = '';
        this.allMessages.push(createTextMessage({ role: 'user', content: message }));

        const assistantMsg = createTextMessage({ role: 'assistant', content: '' });
        this.allMessages.push(assistantMsg);
        const assistantIndex = this.allMessages.length - 1;
        this.streamingMessageId = assistantMsg.id;
        this.sending = true;
        this.receivedStreamChunk = false;
        this.resetStreamQueue();
        this.streamAssistantIndex = assistantIndex;
        let turnTokenUsage = 0;

        try {
          const res = await sendChatMessage({
            message,
            messages: this.allMessages.slice(0, assistantIndex),
            sessionId: this.sessionId,
            apiKeyId: this.currentModel.apiKeyId,
            useDefaultModel: !!this.currentModel.useDefaultIcon,
            onReasoningDelta: (delta) => {
              this.markStreamStarted();
              this.enqueueStreamPart('reasoning', delta, assistantIndex);
            },
            onDelta: (delta) => {
              this.markStreamStarted();
              this.enqueueStreamPart('content', delta, assistantIndex);
            },
            onUsage: (usage) => {
              turnTokenUsage = Number(usage?.total_tokens) || Number(usage?.completion_tokens) || 0;
            },
            onDone: () => {
              if (!this.receivedStreamChunk) {
                this.sending = false;
              }
            },
          });

          await this.drainStreamQueue();
          const receivedChunk = this.receivedStreamChunk;

          if (res.usage) {
            turnTokenUsage =
              Number(res.usage.total_tokens) ||
              Number(res.usage.completion_tokens) ||
              turnTokenUsage;
          }

          if (!receivedChunk) {
            if (res.messages?.length) {
              this.$set(this.allMessages, assistantIndex, {
                ...res.messages[0],
                tokenUsage: turnTokenUsage,
              });
              if (res.messages.length > 1) {
                this.allMessages.push(...res.messages.slice(1));
              }
            } else {
              this.allMessages.splice(assistantIndex, 1);
            }
          } else if (turnTokenUsage > 0) {
            const current = this.allMessages[assistantIndex];
            this.$set(this.allMessages, assistantIndex, {
              ...current,
              tokenUsage: turnTokenUsage,
            });
          }

          this.persistMessages();
          this.scrollToBottom();
        } catch {
          if (!this.receivedStreamChunk) {
            this.allMessages.splice(assistantIndex, 1);
          }
          this.persistMessages();
        } finally {
          this.resetStreamQueue();
          this.sending = false;
          this.streamingMessageId = '';
          this.receivedStreamChunk = false;
        }
      },
      onAttach() {
        if (this.isLocalMode) {
          return;
        }
        this.showAttachmentPicker = true;
      },
      onQuickChip(prompt) {
        this.onSend(prompt);
      },
      onImageSelected(imagePath) {
        this.allMessages.push(createImageMessage({ imagePath }));
        this.persistMessages();
        this.scrollToBottom();
        this.sending = true;
        setTimeout(() => {
          this.allMessages.push(
            createTextMessage({
              role: 'assistant',
              content: this.$t('assistant.imageReceived'),
            })
          );
          this.sending = false;
          this.persistMessages();
          this.scrollToBottom();
        }, 500);
      },
      onModelSelect(model) {
        this.currentModel = model;
        uni.showToast({
          title: this.$t('assistant.switchedModel', { model: model.alias }),
          icon: 'none',
        });
      },
      onHistory() {
        this.refreshChatSessions();
        this.showHistoryDrawer = true;
      },
      async onNewChat() {
        const res = startNewChatSession({
          apiKeyId: this.currentModel.apiKeyId,
        });
        this.applySessionState(res);
        this.showHistoryDrawer = false;
        this.scrollToBottom();
      },
      async onSelectSession(session) {
        const res = switchChatSession(session.id);
        this.applySessionState(res);
        this.scrollToBottom();
      },
      async onDeleteSession(session) {
        const res = removeChatSession(session.id);
        this.applySessionState(res);

        if (!this.sessionId) {
          const created = startNewChatSession({
            apiKeyId: this.currentModel.apiKeyId,
          });
          this.applySessionState(created);
        }

        this.scrollToBottom();
      },
      onCardAction({ action }) {
        const tips = {
          detail: this.$t('assistant.detailDev'),
          export: this.$t('assistant.exportDev'),
          share: this.$t('assistant.shareDev'),
        };
        uni.showToast({ title: tips[action] || this.$t('assistant.featureDev'), icon: 'none' });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .assistant-chat {
    position: relative;
    flex: 1;
    width: 100%;
    min-height: 0;
    height: 0;
    overflow: hidden;
    background-color: $color-bg-page;
  }

  .assistant-chat__header {
    position: relative;
    z-index: 3;
    flex-shrink: 0;
  }

  .assistant-chat__body {
    position: absolute;
    right: 0;
    left: 0;
    z-index: 1;
    overflow: hidden;
  }

  .assistant-chat__footer {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 4;
    background-color: $color-bg-page;
  }

  .assistant-chat__footer--tab {
    padding-bottom: $spacing-md;
  }
</style>
