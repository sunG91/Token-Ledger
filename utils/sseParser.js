/**
 * SSE（Server-Sent Events）增量解析器
 * DeepSeek / OpenAI 兼容流式接口：data: {...}\n\n 结尾 data: [DONE]
 */

export function extractStreamParts(payload = {}) {
  const choice = payload?.choices?.[0];
  if (!choice) {
    return { content: '', reasoning: '' };
  }
  const delta = choice.delta || choice.message || {};
  return {
    content: delta.content || '',
    reasoning: delta.reasoning_content || '',
  };
}

/** @deprecated 使用 extractStreamParts */
export function extractStreamDelta(payload = {}) {
  return extractStreamParts(payload).content;
}

export function createSseParser() {
  let buffer = '';

  return {
    feed(chunk = '') {
      const events = [];
      buffer += String(chunk).replace(/\r\n/g, '\n');
      const parts = buffer.split('\n');
      buffer = parts.pop() || '';

      parts.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) {
          return;
        }
        if (trimmed === 'data: [DONE]') {
          events.push({ done: true });
          return;
        }
        if (!trimmed.startsWith('data: ')) {
          return;
        }
        try {
          events.push({ data: JSON.parse(trimmed.slice(6)) });
        } catch (error) {
          // 忽略不完整 JSON 行
        }
      });

      return events;
    },
    flush() {
      const remaining = buffer;
      buffer = '';
      return remaining ? this.feed(`${remaining}\n`) : [];
    },
  };
}

/**
 * 分发 SSE 事件；done 事件仅作标记，不触发 onDone（由外层在连接结束时统一回调）
 */
export function dispatchSseEvents(events = [], handlers = {}) {
  const { onDelta, onReasoningDelta, onUsage } = handlers;
  let streamDone = false;

  events.forEach((event) => {
    if (event.done) {
      streamDone = true;
      return;
    }
    if (event.data?.usage) {
      onUsage?.(event.data.usage);
    }
    const { content, reasoning } = extractStreamParts(event.data);
    if (reasoning) {
      onReasoningDelta?.(reasoning);
    }
    if (content) {
      onDelta?.(content);
    }
  });

  return { streamDone };
}
