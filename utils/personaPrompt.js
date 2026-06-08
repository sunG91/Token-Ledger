/**
 * 人设 System Prompt 与欢迎语构建
 */
import {
  DEFAULT_PERSONA_ID,
  getPersonaSystemPrompt,
  getPersonaWelcomeText,
} from '@/constants/persona.js';
import {
  getActivePersonaId,
  isPersonaEnabled,
  isPersonaMemoryEnabled,
} from '@/utils/personaConfig.js';
import { searchVectorMemory } from '@/utils/vectorMemory.js';

function buildMemorySection(memories = [], locale = 'zh-CN') {
  if (!memories.length) {
    return '';
  }

  const header =
    locale === 'en-US'
      ? 'Relevant memories about the user (use naturally, do not mention "memory database"):'
      : '关于用户的记忆片段（自然融入对话，不要提及「记忆库」）：';

  const lines = memories.map((item, index) => `${index + 1}. ${item.text}`);
  return `\n\n${header}\n${lines.join('\n')}`;
}

/**
 * 构建聊天 System Prompt（人设 + 记忆检索）
 */
export function buildPersonaChatSystemPrompt({ query = '', locale = 'zh-CN' } = {}) {
  if (!isPersonaEnabled()) {
    return '';
  }

  const personaId = getActivePersonaId() || DEFAULT_PERSONA_ID;
  let prompt = getPersonaSystemPrompt(personaId, locale);

  if (isPersonaMemoryEnabled()) {
    const memories = searchVectorMemory({ query });
    prompt += buildMemorySection(memories, locale);
  }

  return prompt.trim();
}

export function getPersonaWelcome(locale = 'zh-CN', personaId) {
  const id = personaId || getActivePersonaId() || DEFAULT_PERSONA_ID;
  return getPersonaWelcomeText(id, locale);
}
