/**
 * AI 记账助手 API
 */
import http from '@/utils/request.js';
import config from '@/config/index.js';
import { mockSendChat } from '@/constants/mock/assistant.js';
import { createCardMessage, createTextMessage } from '@/utils/chatMessage.js';
import { getLocale } from '@/utils/settings.js';
import { getPlatformChatErrorMessage, sendPlatformChatStream } from '@/api/platformChat.js';
import { isAssistantEligibleApiKey } from '@/utils/boundModels.js';
import { fetchApiKeySecretById } from '@/utils/apiKeyRepository.js';
import { finalizeBookkeepingTurn, prepareBookkeepingTurn } from '@/api/bookkeeping.js';
import { syncApiKeyBalanceAfterChat } from '@/api/apiKeyBalance.js';
import { captureTurnMemory } from '@/utils/personaMemory.js';
import { upsertDailyChatUsage } from '@/utils/bookkeeping/chatUsage.js';
import { getPlatform } from '@/constants/platforms.js';
import { resolvePlatformIdFromApiKey } from '@/utils/platformApiErrors.js';
import {
  DEFAULT_CHAT_MODEL_SENTINEL,
  isDefaultChatModelSentinel,
  resolveChatModelId,
} from '@/constants/platformChatModels.js';

async function persistTurnChatUsage(apiKeyId, usage, useDefaultModel = false) {
  const tokens =
    Number(usage?.total_tokens) ||
    (Number(usage?.prompt_tokens) || 0) + (Number(usage?.completion_tokens) || 0) ||
    Number(usage?.completion_tokens) ||
    0;
  const id = String(apiKeyId || '').trim();
  if (!id || tokens <= 0) {
    return;
  }

  try {
    const key = await fetchApiKeySecretById(id);
    const platformId = resolvePlatformIdFromApiKey(key) || 'other';
    const storedModel = String(key.chatModel || '').trim();
    let modelName = 'unknown';
    if (useDefaultModel || isDefaultChatModelSentinel(storedModel)) {
      modelName = resolveChatModelId(platformId, DEFAULT_CHAT_MODEL_SENTINEL) || 'unknown';
    } else {
      modelName = storedModel || resolveChatModelId(platformId, '') || 'unknown';
    }
    upsertDailyChatUsage({
      apiKeyId: id,
      platformId,
      platformName: getPlatform(platformId).name,
      modelName,
      tokenCount: tokens,
    });
  } catch (error) {
    // ignore
  }
}

async function canUsePlatformChat(apiKeyId) {
  const id = String(apiKeyId || '').trim();
  if (!id) {
    return false;
  }
  try {
    const key = await fetchApiKeySecretById(id);
    return isAssistantEligibleApiKey(key);
  } catch (error) {
    return false;
  }
}

/**
 * 发送对话消息
 * @param {{
 *   message?: string,
 *   messages?: Array,
 *   sessionId?: string,
 *   modelId?: string,
 *   apiKeyId?: string,
 *   onDelta?: (delta: string) => void,
 *   onReasoningDelta?: (delta: string) => void,
 *   onDone?: () => void,
 *   useDefaultModel?: boolean,
 *   onUsage?: (usage: object) => void,
 * }} params
 */
export async function sendChatMessage({
  message,
  messages = [],
  sessionId,
  modelId,
  apiKeyId,
  useDefaultModel = false,
  onDelta,
  onReasoningDelta,
  onDone,
  onUsage,
} = {}) {
  const keyId = apiKeyId || modelId;
  const locale = getLocale();
  const bkPrep = await prepareBookkeepingTurn({
    sessionId,
    locale,
  });

  if (await canUsePlatformChat(keyId)) {
    let chatUsage = null;
    try {
      const result = await sendPlatformChatStream({
        apiKeyId: keyId,
        messages,
        useDefaultModel,
        bookkeepingContext: bkPrep,
        onDelta,
        onReasoningDelta,
        onDone,
        onUsage,
      });

      chatUsage = result.usage || null;
      await persistTurnChatUsage(keyId, chatUsage, useDefaultModel);
      const assistantText = String(result.content || '').trim();

      if (message && assistantText) {
        captureTurnMemory({
          userText: message,
          assistantText,
          sessionId,
        });
      }

      const finalized = await finalizeBookkeepingTurn({
        sessionId,
        userMessage: message,
        recordCards: result.recordCards || [],
        locale,
      });

      const replyMessages = [];
      if (assistantText) {
        replyMessages.push(
          createTextMessage({
            role: 'assistant',
            content: assistantText,
            tokenUsage: result.usage?.total_tokens || result.usage?.completion_tokens || 0,
          })
        );
      }
      const typedCards = [];
      const seenCardKeys = new Set();
      const pushCard = (item) => {
        if (!item?.card) {
          return;
        }
        const key = `${item.type || 'record_card'}:${item.card.platformId}:${item.card.tokenCount}:${item.card.occurredAt || ''}`;
        if (seenCardKeys.has(key)) {
          return;
        }
        seenCardKeys.add(key);
        typedCards.push(item);
      };

      (result.replyCards || []).forEach(pushCard);
      if (!result.replyCards?.length) {
        (result.recordCards || []).forEach((card) => pushCard({ type: 'record_card', card }));
      }
      (finalized.replyCards || []).forEach(pushCard);

      typedCards.forEach((item) => {
        if (!item?.card) {
          return;
        }
        replyMessages.push(
          createCardMessage({
            type: item.type || 'record_card',
            card: item.card,
          })
        );
      });
      return {
        sessionId,
        messages: replyMessages,
        usage: result.usage || null,
        suggestions: [],
      };
    } catch (error) {
      const errLocale = getLocale();
      uni.showToast({
        title: getPlatformChatErrorMessage(error, errLocale),
        icon: 'none',
      });
      throw error;
    } finally {
      void syncApiKeyBalanceAfterChat(keyId, { usage: chatUsage });
    }
  }

  if (config.useMock) {
    return mockSendChat({ message, modelId, sessionId, locale });
  }

  const res = await http.post('/assistant/chat', {
    message,
    session_id: sessionId,
    model_id: modelId,
  });

  const data = res.data || {};
  const replyMessages = [];

  if (data.reply) {
    replyMessages.push(
      createTextMessage({
        role: 'assistant',
        content: data.reply,
      })
    );
  }

  if (data.card) {
    replyMessages.push(
      createCardMessage({
        type: data.card_type || 'usage_card',
        card: data.card,
      })
    );
  }

  return {
    sessionId: data.session_id || sessionId,
    messages: replyMessages,
    suggestions: data.suggestions || [],
  };
}
