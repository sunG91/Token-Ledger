/**
 * OpenAI 兼容 Chat Completions（流式 / 非流式）
 * @see https://api-docs.deepseek.com/zh-cn/api/create-chat-completion
 */
import {
  PLATFORM_API_ERROR,
  createClientPlatformError,
  createHttpPlatformError,
  createPlatformApiError,
  resolvePlatformIdFromEndpoint,
} from '@/utils/platformApiErrors.js';
import { buildChatRequestBody } from '@/utils/chatRequestBody.js';
import { createSseParser, dispatchSseEvents } from '@/utils/sseParser.js';

const REQUEST_TIMEOUT_MS = 120000;
const FALLBACK_STREAM_CHAR_STEP = 2;
const FALLBACK_STREAM_DELAY_MS = 18;

function decodeChunkData(data) {
  if (!data) {
    return '';
  }
  if (typeof data === 'string') {
    return data;
  }
  try {
    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder('utf-8').decode(data);
    }
  } catch (error) {
    // ignore
  }
  const bytes = new Uint8Array(data);
  let result = '';
  for (let i = 0; i < bytes.length; i += 1) {
    result += String.fromCharCode(bytes[i]);
  }
  try {
    return decodeURIComponent(escape(result));
  } catch (error) {
    return result;
  }
}

export function emitStreamingText(text = '', emit, step = FALLBACK_STREAM_CHAR_STEP) {
  const payload = String(text || '');
  if (!payload || typeof emit !== 'function') {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let index = 0;
    const tick = () => {
      if (index >= payload.length) {
        resolve();
        return;
      }
      const slice = payload.slice(index, index + step);
      index += step;
      emit(slice);
      setTimeout(tick, FALLBACK_STREAM_DELAY_MS);
    };
    tick();
  });
}

function createStreamHandlers(handlers = {}) {
  const parser = createSseParser();
  let finished = false;

  const feed = (chunk = '') => {
    if (!chunk || finished) {
      return;
    }
    dispatchSseEvents(parser.feed(chunk), handlers);
  };

  const flush = () => {
    if (finished) {
      return;
    }
    dispatchSseEvents(parser.flush(), handlers);
  };

  const complete = (usage) => {
    if (finished) {
      return;
    }
    finished = true;
    flush();
    if (usage) {
      handlers.onUsage?.(usage);
    }
    handlers.onDone?.();
  };

  const abort = (error) => {
    if (finished) {
      return;
    }
    finished = true;
    handlers.onError?.(error);
  };

  return { feed, flush, complete, abort, isFinished: () => finished };
}

/** H5 / App 优先用 XHR 增量读取 SSE */
function createProgressXhr() {
  if (typeof plus !== 'undefined' && plus.net?.XMLHttpRequest) {
    return new plus.net.XMLHttpRequest();
  }

  if (typeof XMLHttpRequest !== 'undefined') {
    return new XMLHttpRequest();
  }

  return null;
}

function requestChatCompletionStreamXhr({ url, apiKey, body, platformId, handlers }) {
  const xhr = createProgressXhr();
  if (!xhr) {
    return Promise.reject(new Error('xhr unavailable'));
  }

  const stream = createStreamHandlers(handlers);

  return new Promise((resolve) => {
    let lastLength = 0;
    let settled = false;

    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      resolve(null);
    };

    const drainResponse = () => {
      const text = xhr.responseText || '';
      if (text.length <= lastLength) {
        return;
      }
      const chunk = text.slice(lastLength);
      lastLength = text.length;
      stream.feed(chunk);
    };

    const handleHttpError = (status, rawBody = '') => {
      let errorBody = rawBody;
      try {
        errorBody = JSON.parse(rawBody);
      } catch (error) {
        // ignore
      }
      stream.abort(createHttpPlatformError(platformId, status, errorBody));
      finish();
    };

    xhr.open('POST', url, true);
    xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'text/event-stream');
    xhr.timeout = REQUEST_TIMEOUT_MS;

    xhr.onprogress = () => {
      drainResponse();
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 3) {
        drainResponse();
        return;
      }
      if (xhr.readyState !== 4) {
        return;
      }

      drainResponse();

      if (xhr.status < 200 || xhr.status >= 300) {
        handleHttpError(xhr.status, xhr.responseText);
        return;
      }

      stream.complete();
      finish();
    };

    xhr.onerror = () => {
      stream.abort(
        createPlatformApiError({
          code: PLATFORM_API_ERROR.NETWORK_ERROR,
          platformId,
          i18nKey: 'networkError',
        })
      );
      finish();
    };

    xhr.ontimeout = () => {
      stream.abort(
        createPlatformApiError({
          code: PLATFORM_API_ERROR.NETWORK_ERROR,
          platformId,
          i18nKey: 'networkError',
        })
      );
      finish();
    };

    xhr.send(JSON.stringify(body));
  });
}

function requestChatCompletionStreamUni({ url, apiKey, body, platformId, handlers }) {
  const stream = createStreamHandlers(handlers);
  let requestTask = null;
  let receivedChunk = false;

  requestTask = uni.request({
    url,
    method: 'POST',
    timeout: REQUEST_TIMEOUT_MS,
    enableChunked: true,
    responseType: 'text',
    header: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    data: body,
    success: (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        stream.abort(createHttpPlatformError(platformId, res.statusCode, res.data));
        return;
      }

      if (!receivedChunk) {
        if (typeof res.data === 'string' && res.data.trim()) {
          stream.feed(`${res.data}\n`);
        } else if (res.data && typeof res.data === 'object') {
          const content = res.data?.choices?.[0]?.message?.content || '';
          if (content) {
            handlers.onDelta?.(content);
          }
          stream.complete(res.data?.usage);
          return;
        }
      }

      stream.complete(res.data?.usage);
    },
    fail: () => {
      stream.abort(
        createPlatformApiError({
          code: PLATFORM_API_ERROR.NETWORK_ERROR,
          platformId,
          i18nKey: 'networkError',
        })
      );
    },
  });

  if (requestTask && typeof requestTask.onChunkReceived === 'function') {
    requestTask.onChunkReceived((res) => {
      receivedChunk = true;
      stream.feed(decodeChunkData(res.data));
    });
  }

  return requestTask;
}

function requestChatCompletionBlocking({ url, apiKey, body, platformId }) {
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method: 'POST',
      timeout: REQUEST_TIMEOUT_MS,
      header: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      data: body,
      success: (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(createHttpPlatformError(platformId, res.statusCode, res.data));
          return;
        }
        const message = res.data?.choices?.[0]?.message || {};
        resolve({
          content: message.content || '',
          reasoning: message.reasoning_content || '',
          usage: res.data?.usage || null,
          message,
          raw: res.data || null,
        });
      },
      fail: () => {
        reject(
          createPlatformApiError({
            code: PLATFORM_API_ERROR.NETWORK_ERROR,
            platformId,
            i18nKey: 'networkError',
          })
        );
      },
    });
  });
}

/**
 * AI + Tools 多轮阻塞补全（口语记账等结构化任务）
 */
export async function runChatCompletionWithToolLoop({
  endpoint,
  apiKey,
  model,
  messages = [],
  tools = [],
  platformId,
  maxRounds = 5,
  onToolCall,
} = {}) {
  const url = String(endpoint || '').trim();
  const key = String(apiKey || '').trim();
  const resolvedPlatformId = platformId || resolvePlatformIdFromEndpoint(url) || 'generic';

  if (!url || !key || !model) {
    throw createClientPlatformError(PLATFORM_API_ERROR.CHAT_MODEL_REQUIRED, resolvedPlatformId);
  }

  const loopMessages = Array.isArray(messages) ? [...messages] : [];
  const replyCards = [];
  let usage = null;

  const stripThinkingFields = (body = {}) => {
    const next = { ...body };
    delete next.thinking;
    delete next.reasoning_effort;
    return next;
  };

  const requestOnce = async (body) => {
    try {
      return await requestChatCompletionBlocking({
        url,
        apiKey: key,
        platformId: resolvedPlatformId,
        body,
      });
    } catch (error) {
      if (body.thinking) {
        return requestChatCompletionBlocking({
          url,
          apiKey: key,
          platformId: resolvedPlatformId,
          body: stripThinkingFields(body),
        });
      }
      throw error;
    }
  };

  for (let round = 0; round < maxRounds; round += 1) {
    const body = buildChatRequestBody({
      model,
      messages: loopMessages,
      stream: false,
      tools,
      toolChoice: 'auto',
    });
    const result = await requestOnce(body);
    usage = result.usage || usage;
    const assistantMessage = result.message || {};

    if (!assistantMessage.tool_calls?.length) {
      return {
        content: assistantMessage.content || result.content || '',
        usage,
        replyCards,
        recordCards: replyCards
          .filter((item) => item.type === 'record_card')
          .map((item) => item.card),
      };
    }

    loopMessages.push(assistantMessage);

    for (const toolCall of assistantMessage.tool_calls) {
      const execResult =
        typeof onToolCall === 'function'
          ? await onToolCall(toolCall)
          : { data: { ok: false, error: 'tool_handler_missing' } };

      if (execResult?.recordCard) {
        replyCards.push({ type: 'record_card', card: execResult.recordCard });
      }
      if (Array.isArray(execResult?.replyCards)) {
        execResult.replyCards.forEach((item) => {
          if (item?.type && item?.card) {
            replyCards.push(item);
          }
        });
      }

      loopMessages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(execResult?.data || execResult || {}),
      });
    }
  }

  const finalBody = buildChatRequestBody({
    model,
    messages: loopMessages,
    stream: false,
  });
  const finalResult = await requestOnce(finalBody);
  return {
    content: finalResult.content || '',
    usage: finalResult.usage || usage,
    replyCards,
    recordCards: replyCards.filter((item) => item.type === 'record_card').map((item) => item.card),
  };
}

function startStreamRequest(params) {
  if (createProgressXhr()) {
    return requestChatCompletionStreamXhr(params);
  }
  return Promise.resolve(requestChatCompletionStreamUni(params));
}

/**
 * 流式对话补全；仅在流式完全失败时降级为非流式（降级也按字吐出）
 */
export function streamChatCompletion({
  endpoint,
  apiKey,
  model,
  messages = [],
  platformId: platformIdOption,
  onDelta,
  onReasoningDelta,
  onDone,
  onUsage,
}) {
  const url = String(endpoint || '').trim();
  const key = String(apiKey || '').trim();
  const platformId = platformIdOption || resolvePlatformIdFromEndpoint(url) || 'generic';

  if (!url) {
    return Promise.reject(
      createClientPlatformError(PLATFORM_API_ERROR.CHAT_ENDPOINT_REQUIRED, platformId)
    );
  }
  if (!key) {
    return Promise.reject(
      createClientPlatformError(PLATFORM_API_ERROR.API_KEY_REQUIRED, platformId)
    );
  }
  if (!model) {
    return Promise.reject(
      createClientPlatformError(PLATFORM_API_ERROR.CHAT_MODEL_REQUIRED, platformId)
    );
  }

  const streamBody = buildChatRequestBody({ model, messages, stream: true });
  const blockingBody = buildChatRequestBody({ model, messages, stream: false });

  return new Promise((resolve, reject) => {
    let content = '';
    let usage = null;
    let settled = false;
    let receivedStreamDelta = false;

    const settle = (payload = {}) => {
      if (settled) {
        return;
      }
      settled = true;
      resolve({
        content: payload.content ?? content,
        usage: payload.usage ?? usage,
      });
    };

    const fail = (error) => {
      if (settled) {
        return;
      }
      settled = true;
      reject(error);
    };

    const stripThinkingFields = (body = {}) => {
      const next = { ...body };
      delete next.thinking;
      delete next.reasoning_effort;
      return next;
    };

    const isInvalidParamsError = (error = {}) => {
      const status = Number(error.status || error.statusCode || error.code);
      return status === 400 || status === 422;
    };

    const runBlockingFallback = (body = blockingBody) => {
      requestChatCompletionBlocking({
        url,
        apiKey: key,
        platformId,
        body,
      })
        .then(async (result) => {
          if (result.reasoning) {
            receivedStreamDelta = true;
            await emitStreamingText(result.reasoning, (slice) => {
              onReasoningDelta?.(slice);
            });
          }
          if (result.content) {
            receivedStreamDelta = true;
            await emitStreamingText(result.content, (slice) => {
              onDelta?.(slice);
              content += slice;
            });
          }
          usage = result.usage;
          onUsage?.(usage);
          onDone?.();
          settle({ content: result.content || content, usage });
        })
        .catch((error) => {
          if (body.thinking && isInvalidParamsError(error)) {
            runBlockingFallback(stripThinkingFields(body));
            return;
          }
          fail(error);
        });
    };

    const handlers = {
      onReasoningDelta: (delta) => {
        if (!delta) {
          return;
        }
        receivedStreamDelta = true;
        onReasoningDelta?.(delta);
      },
      onDelta: (delta) => {
        if (!delta) {
          return;
        }
        receivedStreamDelta = true;
        content += delta;
        onDelta?.(delta);
      },
      onUsage: (nextUsage) => {
        usage = nextUsage;
        onUsage?.(nextUsage);
      },
      onDone: () => {
        onDone?.();
        settle({ content, usage });
      },
      onError: (error) => {
        if (!receivedStreamDelta) {
          runBlockingFallback();
          return;
        }
        fail(error);
      },
    };

    const tryStreamRequest = (body) => {
      startStreamRequest({
        url,
        apiKey: key,
        body,
        platformId,
        handlers: {
          ...handlers,
          onError: (error) => {
            if (!receivedStreamDelta && body.thinking && isInvalidParamsError(error)) {
              tryStreamRequest(stripThinkingFields(body));
              return;
            }
            handlers.onError(error);
          },
        },
      }).catch(() => {
        if (!receivedStreamDelta) {
          runBlockingFallback(body.thinking ? stripThinkingFields(body) : body);
        }
      });
    };

    tryStreamRequest(streamBody);
  });
}
