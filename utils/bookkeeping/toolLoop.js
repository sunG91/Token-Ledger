/**
 * 口语记账：AI + Tools 多轮调用
 */
import { emitStreamingText, runChatCompletionWithToolLoop } from '@/utils/chatCompletion.js';
import { executeAssistantToolCall } from '@/utils/assistant/executor.js';

export async function runBookkeepingAiTurn({
  endpoint,
  apiKey,
  model,
  messages = [],
  tools = [],
  platformId,
  sessionId = '',
  locale = 'zh-CN',
  maxRounds = 5,
  onDelta,
  onDone,
} = {}) {
  const result = await runChatCompletionWithToolLoop({
    endpoint,
    apiKey,
    model,
    messages,
    tools,
    platformId,
    maxRounds,
    onToolCall: (toolCall) => executeAssistantToolCall(toolCall, { sessionId, locale }),
  });

  if (result.content && typeof onDelta === 'function') {
    await emitStreamingText(result.content, onDelta);
  }
  onDone?.();

  return result;
}
