/**
 * Chat Completions 请求体：按模型自动附加 thinking（不支持则忽略）
 */

const THINKING_MODEL_PATTERNS = [/reasoner/i, /v4-pro/i, /deepseek-r1/i, /r1-/i];

export function modelSupportsThinking(model = '') {
  const id = String(model || '').trim();
  if (!id) {
    return false;
  }
  return THINKING_MODEL_PATTERNS.some((pattern) => pattern.test(id));
}

export function buildChatRequestBody({
  model,
  messages,
  stream = true,
  tools = null,
  toolChoice = 'auto',
} = {}) {
  const body = {
    model: String(model || '').trim(),
    messages: Array.isArray(messages) ? messages : [],
    stream: !!stream,
  };

  if (stream) {
    body.stream_options = { include_usage: true };
  }

  if (Array.isArray(tools) && tools.length) {
    body.tools = tools;
    body.tool_choice = toolChoice;
  }

  if (modelSupportsThinking(body.model) && !(Array.isArray(tools) && tools.length)) {
    body.thinking = { type: 'enabled' };
    body.reasoning_effort = 'high';
  }

  return body;
}
