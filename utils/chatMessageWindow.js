/**
 * 会话消息窗口：按「轮次」分页展示（兼容 Web / iOS / Android / 小程序）
 * 1 轮 = 一条用户消息及其后的助手回复
 */
import { CHAT_INITIAL_ROUNDS, CHAT_LOAD_MORE_ROUNDS } from '@/constants/chat.js';

/** 用户消息索引（每一轮起点） */
export function findUserRoundIndices(messages = []) {
  return messages
    .map((msg, index) => (msg.role === 'user' ? index : -1))
    .filter((index) => index >= 0);
}

export function computeMessageWindow(messages = [], maxRounds = CHAT_INITIAL_ROUNDS) {
  const list = Array.isArray(messages) ? messages : [];
  const roundStarts = findUserRoundIndices(list);

  if (!roundStarts.length || roundStarts.length <= maxRounds) {
    return {
      firstLoadedIndex: 0,
      hasMore: false,
      totalRounds: roundStarts.length,
    };
  }

  const firstLoadedIndex = roundStarts[roundStarts.length - maxRounds];
  return {
    firstLoadedIndex,
    hasMore: firstLoadedIndex > 0,
    totalRounds: roundStarts.length,
  };
}

export function loadOlderMessageWindow(
  messages = [],
  firstLoadedIndex = 0,
  moreRounds = CHAT_LOAD_MORE_ROUNDS
) {
  const list = Array.isArray(messages) ? messages : [];
  const roundStarts = findUserRoundIndices(list);
  const safeIndex = Math.max(0, Number(firstLoadedIndex) || 0);

  if (!roundStarts.length || safeIndex <= 0) {
    return {
      firstLoadedIndex: 0,
      hasMore: false,
      loaded: false,
    };
  }

  const currentRound = roundStarts.findIndex((index) => index >= safeIndex);
  if (currentRound <= 0) {
    return {
      firstLoadedIndex: 0,
      hasMore: false,
      loaded: safeIndex > 0,
    };
  }

  const nextRound = Math.max(0, currentRound - moreRounds);
  const nextIndex = roundStarts[nextRound];

  return {
    firstLoadedIndex: nextIndex,
    hasMore: nextIndex > 0,
    loaded: true,
  };
}

export function sliceVisibleMessages(messages = [], firstLoadedIndex = 0) {
  const list = Array.isArray(messages) ? messages : [];
  const start = Math.max(0, Math.min(Number(firstLoadedIndex) || 0, list.length));
  return list.slice(start);
}
