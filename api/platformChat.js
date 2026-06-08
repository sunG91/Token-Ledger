/**
 * 直连厂商 Chat Completions（流式 / 口语记账 AI+Tools）
 */
import { fetchApiKeySecretById } from '@/utils/apiKeyRepository.js';
import { resolveChatEndpoint } from '@/utils/apiKeyEndpoints.js';
import { streamChatCompletion } from '@/utils/chatCompletion.js';
import { buildChatCompletionMessages } from '@/utils/chatMessage.js';
import { pruneMessagesForContext } from '@/utils/chatContext.js';
import {
  DEFAULT_CHAT_MODEL_SENTINEL,
  isDefaultChatModelSentinel,
  resolveChatModelId,
} from '@/constants/platformChatModels.js';
import {
  PLATFORM_API_ERROR,
  createClientPlatformError,
  formatPlatformApiError,
  resolvePlatformIdFromApiKey,
} from '@/utils/platformApiErrors.js';
import { isAssistantEligibleApiKey } from '@/utils/boundModels.js';
import { buildPersonaChatSystemPrompt } from '@/utils/personaPrompt.js';
import { getLocale } from '@/utils/settings.js';
import { runBookkeepingAiTurn } from '@/utils/bookkeeping/toolLoop.js';

function resolveRequestModel(key = {}) {
  const platformId = resolvePlatformIdFromApiKey(key);
  const storedModel = String(key.chatModel || '').trim();

  if (!storedModel && platformId) {
    const fallback = resolveChatModelId(platformId, '');
    if (!fallback) {
      throw createClientPlatformError(PLATFORM_API_ERROR.CHAT_MODEL_REQUIRED, platformId);
    }
    return fallback;
  }

  if (isDefaultChatModelSentinel(storedModel)) {
    const resolved = resolveChatModelId(platformId, storedModel);
    if (!resolved) {
      throw createClientPlatformError(PLATFORM_API_ERROR.CHAT_MODEL_REQUIRED, platformId);
    }
    return resolved;
  }

  return storedModel;
}

/**
 * 流式发送对话消息
 * @param {{
 *   apiKeyId: string,
 *   messages?: Array,
 *   onDelta?: (delta: string) => void,
 *   onReasoningDelta?: (delta: string) => void,
 *   onDone?: () => void,
 *   useDefaultModel?: boolean,
 *   onUsage?: (usage: object) => void,
 *   bookkeepingContext?: object,
 * }} params
 */
export async function sendPlatformChatStream({
  apiKeyId,
  messages = [],
  useDefaultModel = false,
  bookkeepingContext = null,
  onDelta,
  onReasoningDelta,
  onDone,
  onUsage,
} = {}) {
  const id = String(apiKeyId || '').trim();
  if (!id) {
    throw createClientPlatformError(PLATFORM_API_ERROR.API_KEY_REQUIRED);
  }

  const key = await fetchApiKeySecretById(id);
  if (!isAssistantEligibleApiKey(key)) {
    throw createClientPlatformError(PLATFORM_API_ERROR.CHAT_MODEL_REQUIRED);
  }

  const endpoint = resolveChatEndpoint(key);
  const platformId = resolvePlatformIdFromApiKey(key);
  if (!endpoint) {
    throw createClientPlatformError(PLATFORM_API_ERROR.CHAT_ENDPOINT_REQUIRED, platformId);
  }

  const model = useDefaultModel
    ? resolveChatModelId(platformId, DEFAULT_CHAT_MODEL_SENTINEL)
    : resolveRequestModel(key);
  const chatMessages = buildChatCompletionMessages(pruneMessagesForContext(messages));
  if (!chatMessages.length) {
    throw createClientPlatformError(PLATFORM_API_ERROR.CHAT_MODEL_REQUIRED, platformId);
  }

  const lastUserMessage = [...messages]
    .reverse()
    .find(
      (item) => item.role === 'user' && item.type === 'text' && String(item.content || '').trim()
    );
  const locale = getLocale();
  const personaSystemPrompt = buildPersonaChatSystemPrompt({
    query: lastUserMessage?.content || '',
    locale,
  });
  const bookkeepingSystemPrompt = String(bookkeepingContext?.systemPrompt || '').trim();
  const mergedSystemPrompt = [personaSystemPrompt, bookkeepingSystemPrompt]
    .filter(Boolean)
    .join('\n\n');
  if (mergedSystemPrompt) {
    chatMessages.unshift({
      role: 'system',
      content: mergedSystemPrompt,
    });
  }

  if (bookkeepingContext?.useTools && bookkeepingContext?.tools?.length) {
    const aiResult = await runBookkeepingAiTurn({
      endpoint,
      apiKey: key.apiKey,
      model,
      messages: chatMessages,
      tools: bookkeepingContext.tools,
      platformId,
      sessionId: bookkeepingContext.sessionId,
      locale,
      onDelta,
      onDone,
    });
    onUsage?.(aiResult.usage);
    return {
      content: aiResult.content || '',
      usage: aiResult.usage || null,
      replyCards: aiResult.replyCards || [],
      recordCards: aiResult.recordCards || [],
    };
  }

  return streamChatCompletion({
    endpoint,
    apiKey: key.apiKey,
    model,
    messages: chatMessages,
    platformId,
    onDelta,
    onReasoningDelta,
    onDone,
    onUsage,
  });
}

export function getPlatformChatErrorMessage(error, locale) {
  return formatPlatformApiError(error, locale || getLocale());
}
