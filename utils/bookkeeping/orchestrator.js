/**
 * AI 助手编排：构建上下文 + tools，由模型语义判断
 */
import { buildAssistantBoundContext } from '@/utils/assistant/boundContext.js';
import { tryAutoConfirmPendingRecord } from '@/utils/assistant/executor.js';
import { listAllUsageRecords } from '@/utils/assistant/recordCatalog.js';
import { listIncompletePending } from '@/utils/bookkeeping/pendingMemory.js';
import { buildAssistantSystemPrompt } from '@/utils/assistant/prompt.js';
import { buildAssistantTools } from '@/utils/assistant/tools.js';

export async function prepareBookkeepingTurn({ sessionId = '', locale = 'zh-CN' } = {}) {
  const boundKeys = await buildAssistantBoundContext();
  const pending = listIncompletePending();
  const usageRecordCount = listAllUsageRecords().length;
  const systemPrompt = buildAssistantSystemPrompt({
    boundKeys,
    pending,
    sessionId,
    locale,
    usageRecordCount,
  });
  const tools = buildAssistantTools(locale);

  return {
    active: true,
    useTools: true,
    systemPrompt,
    tools,
    sessionId,
    boundKeys,
    boundModels: boundKeys.filter((item) => item.chatEligible),
    pending,
  };
}

/**
 * 回合收尾：模型未调用 confirm_voice_record 时，尝试用待补全记忆 + 用户口述自动入账
 */
export async function finalizeBookkeepingTurn({
  sessionId = '',
  userMessage = '',
  recordCards = [],
  locale = 'zh-CN',
} = {}) {
  if (Array.isArray(recordCards) && recordCards.length) {
    return { recordCards, replyCards: [], autoSaved: false };
  }

  const autoResult = await tryAutoConfirmPendingRecord({
    sessionId,
    userMessage,
    locale,
  });

  if (!autoResult?.recordCard) {
    return { recordCards: [], replyCards: [], autoSaved: false };
  }

  return {
    recordCards: [autoResult.recordCard],
    replyCards: [{ type: 'record_card', card: autoResult.recordCard }],
    autoSaved: true,
  };
}
