/**
 * AI 记账助手 Mock 对话（按语言返回文案）
 */
import dayjs from 'dayjs';
import { LOCALE_CODES } from '@/constants/settings.js';
import { getPlatform } from '@/constants/platforms.js';
import { translate } from '@/i18n/index.js';
import { getLocale } from '@/utils/settings.js';
import { createCardMessage, createTextMessage, formatChatTime } from '@/utils/chatMessage.js';
import { isPersonaEnabled } from '@/utils/personaConfig.js';
import { getPersonaWelcome } from '@/utils/personaPrompt.js';
import { buildMonthlyQuota } from '@/utils/monthlyOverview.js';
import { notifyMonthlyOverviewChanged } from '@/utils/monthlyOverviewEvents.js';
import {
  adjustMonthlyPlanQuota,
  upsertMonthlyPlanItem,
  upsertSharedPlanTokens,
} from '@/utils/monthlyPlanStore.js';
import { MONTHLY_PLAN_SCOPE } from '@/constants/monthlyOverview.js';
import { createUserRecord, buildRecordCard } from '@/utils/bookkeeping/recordStore.js';
import { resolveRecordPlatformFromArgs } from '@/utils/bookkeeping/recordPlatform.js';
import { USAGE_PERIOD } from '@/constants/usageAnalytics.js';
import { queryUsageDataset } from '@/utils/assistant/usageAnalytics.js';
import { buildPeriodUsageReport } from '@/utils/assistant/usageReport.js';

function resolveLocale(locale) {
  return locale || getLocale();
}

function t(locale, key, params) {
  return translate(resolveLocale(locale), key, params);
}

function getWelcomeSuggestions(locale) {
  return [t(locale, 'assistant.suggestionReport'), t(locale, 'assistant.suggestionRanking')];
}

function delay(ms = 600) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function formatReportMonth(locale) {
  if (resolveLocale(locale) === LOCALE_CODES.EN) {
    return dayjs().format('MMMM YYYY');
  }
  return dayjs().format('YYYY年M月');
}

function buildUsageCard(platformId, locale) {
  const platform = getPlatform(platformId);
  return {
    platformId,
    platformName: platform.name,
    title: t(locale, 'assistant.usageTitleToday', { platform: platform.name }),
    tokenCount: 2320,
    costAmount: 23.2,
  };
}

function buildReportCard(locale) {
  const dataset = queryUsageDataset({ period: USAGE_PERIOD.MONTH });
  if (!dataset.records.length) {
    return {
      title: t(locale, 'assistant.reportTitle', { month: formatReportMonth(locale) }),
      totalTokens: 0,
      recordCount: 0,
      internal: { totalTokens: 0, recordCount: 0, platforms: [] },
      external: { totalTokens: 0, recordCount: 0, platforms: [] },
      topModels: [],
      quota: null,
    };
  }
  return buildPeriodUsageReport(dataset, { locale, includeQuota: true });
}

function buildRankingCard(locale) {
  return {
    title: t(locale, 'assistant.rankingTitle'),
    period: t(locale, 'assistant.rankingPeriod'),
    items: [
      { platformId: 'deepseek', name: 'DeepSeek', tokenCount: 5200 },
      { platformId: 'openai', name: 'OpenAI', tokenCount: 3800 },
      { platformId: 'claude', name: 'Claude', tokenCount: 2100 },
      { platformId: 'kimi', name: 'Kimi', tokenCount: 890 },
      {
        platformId: 'qwen',
        name: translate(resolveLocale(locale), 'platforms.qwen'),
        tokenCount: 560,
      },
    ],
  };
}

function isVoiceRecordIntent(text = '') {
  const value = String(text || '').trim();
  return (
    /记一笔|记账|记录|消耗了|使用了|用了|统计.*token|add a record|add record|log.*token/i.test(
      value
    ) && /\d|万|w\b|token/i.test(value)
  );
}

function persistMockVoiceRecord(message = '') {
  const text = String(message || '').trim();
  const tokenCount = extractTokenCount(text);
  const resolved = resolveRecordPlatformFromArgs({
    user_description: text,
    scenario: text,
  });
  return createUserRecord({
    platformId: resolved.platformId,
    platformName: resolved.platformName,
    modelName: resolved.modelName,
    tokenCount,
    scenario: text,
  });
}

function detectPlatform(text) {
  const lower = text.toLowerCase();
  if (lower.includes('deepseek')) return 'deepseek';
  if (lower.includes('openai') || lower.includes('chatgpt') || lower.includes('gpt'))
    return 'openai';
  if (lower.includes('claude')) return 'claude';
  if (lower.includes('kimi')) return 'kimi';
  if (lower.includes('通义') || lower.includes('qwen')) return 'qwen';
  return 'deepseek';
}

function extractTokenCount(text) {
  const wanMatch = text.match(/(\d+(?:\.\d+)?)\s*万/);
  if (wanMatch) {
    return Math.round(Number(wanMatch[1]) * 10000);
  }
  const wMatch = text.match(/(\d+(?:\.\d+)?)\s*w\b/i);
  if (wMatch) {
    return Math.round(Number(wMatch[1]) * 10000);
  }
  const match = text.match(/(\d[\d,]*)\s*token/i);
  if (match) {
    return Number(match[1].replace(/,/g, ''));
  }
  const numMatch = text.match(/(\d[\d,]*)/);
  return numMatch ? Number(numMatch[1].replace(/,/g, '')) : 500;
}

function buildMonthlyPlanReply(locale, message) {
  const text = message.trim();
  const tokens = extractTokenCount(text);
  const isDeduct = /扣|减|deduct/i.test(text);
  const isTotal = /总额|总预算|总计划|公用|total|overall/i.test(text);
  const { platformId, platformName } = resolveRecordPlatformFromArgs({
    user_description: text,
  });
  const platform = getPlatform(platformId);

  if (isDeduct) {
    const result = adjustMonthlyPlanQuota({
      platformId,
      platformName: platform.name,
      tokenDelta: -tokens,
      targetScope: MONTHLY_PLAN_SCOPE.SHARED,
      reason: text,
    });
    if (!result.ok) {
      return { reply: t(locale, 'assistant.replyFallback') };
    }
    notifyMonthlyOverviewChanged();
    const quota = buildMonthlyQuota();
    return {
      reply: t(locale, 'assistant.monthlyPlan.sharedQuotaDeducted', {
        tokens,
        shared: result.sharedPlannedTokens,
        total: result.totalPlannedTokens,
      }),
      extra: { remaining: quota.remainingTokens },
    };
  }

  if (isTotal || !/deepseek|openai|claude|kimi|qwen|gemini|模型|model/i.test(text)) {
    const result = upsertSharedPlanTokens({ plannedTokens: tokens });
    if (!result.ok) {
      return { reply: t(locale, 'assistant.replyFallback') };
    }
    notifyMonthlyOverviewChanged();
    const quota = buildMonthlyQuota();
    return {
      reply: t(locale, 'assistant.monthlyPlan.sharedPlanAdded', {
        tokens,
        shared: result.sharedPlannedTokens,
        total: result.totalPlannedTokens,
      }),
      extra: { remaining: quota.remainingTokens },
    };
  }

  const result = upsertMonthlyPlanItem({
    platformId,
    platformName: platformName || platform.name,
    modelName: `${platformId}-chat`,
    plannedTokens: tokens,
  });
  if (!result.ok) {
    return { reply: t(locale, 'assistant.replyFallback') };
  }
  notifyMonthlyOverviewChanged();
  const quota = buildMonthlyQuota();
  return {
    reply: t(locale, 'assistant.monthlyPlan.planAdded', {
      platform: platform.name,
      model: `${platformId}-chat`,
      tokens,
      total: result.totalPlannedTokens,
    }),
    extra: { remaining: quota.remainingTokens },
  };
}

function matchIntent(message, locale) {
  const text = message.trim();
  const lower = text.toLowerCase();

  if (
    /额度|预算|计划用量|remaining quota|monthly plan|monthly quota|set.*plan/i.test(text) &&
    /\d|万|w\b/i.test(text)
  ) {
    const planReply = buildMonthlyPlanReply(locale, text);
    return {
      reply: planReply.reply,
      suggestions: getWelcomeSuggestions(locale),
    };
  }

  if (isVoiceRecordIntent(text)) {
    const record = persistMockVoiceRecord(text);
    if (!record.saved) {
      return {
        reply: t(locale, 'assistant.recordSaveFailed'),
        suggestions: getWelcomeSuggestions(locale),
      };
    }
    const replyKey =
      record.platformId === 'other' ? 'assistant.replyRecordedOther' : 'assistant.replyRecorded';
    return {
      reply: t(locale, replyKey, {
        platform: record.platformName,
        name: record.platformName,
        count: record.tokenCount,
      }),
      card: buildRecordCard(record),
      cardType: 'record_card',
    };
  }

  if (/月度报告|使用报告|生成报告|本月报告|monthly report|usage report/i.test(text)) {
    return {
      reply: t(locale, 'assistant.replyReport'),
      card: buildReportCard(locale),
      cardType: 'report_card',
    };
  }

  if (/消耗最多|用得最多|排行|排名|most|ranking/i.test(text)) {
    return {
      reply: t(locale, 'assistant.replyRanking'),
      card: buildRankingCard(locale),
      cardType: 'ranking_card',
    };
  }

  if (/消耗|用了|用量|token|usage/i.test(lower)) {
    const platformId = detectPlatform(text);
    return {
      reply: t(locale, 'assistant.replyUsage', {
        platform: getPlatform(platformId).name,
      }),
      card: buildUsageCard(platformId, locale),
      cardType: 'usage_card',
    };
  }

  return {
    reply: t(locale, 'assistant.replyFallback'),
    suggestions: getWelcomeSuggestions(locale),
  };
}

/** 初始欢迎消息 */
export function getWelcomeMessages(locale) {
  const welcomeContent = isPersonaEnabled()
    ? getPersonaWelcome(resolveLocale(locale))
    : t(locale, 'assistant.welcome');

  return [
    createTextMessage({
      role: 'assistant',
      content: welcomeContent,
      showTime: false,
      excludeFromContext: true,
    }),
  ];
}

/** 模拟历史消息（上拉加载更早记录） */
const HISTORY_POOL = (() => {
  const base = dayjs().subtract(1, 'day');
  return [
    createTextMessage({
      role: 'user',
      content: '昨天 OpenAI 用了多少？',
      createdAt: base.hour(14).minute(20).toISOString(),
    }),
    createCardMessage({
      type: 'usage_card',
      card: {
        ...buildUsageCard('openai', LOCALE_CODES.ZH),
        title: 'OpenAI 昨天共消耗',
        tokenCount: 1850,
        costAmount: 18.5,
      },
      createdAt: base.hour(14).minute(21).toISOString(),
    }),
    createTextMessage({
      role: 'user',
      content: '记一笔 Kimi 320 token',
      createdAt: base.hour(16).minute(5).toISOString(),
    }),
    createCardMessage({
      type: 'record_card',
      card: buildRecordCard('kimi', 320),
      createdAt: base.hour(16).minute(6).toISOString(),
    }),
  ].map((item) => ({
    ...item,
    displayTime: formatChatTime(item.createdAt),
  }));
})();

export async function mockSendChat({ message, locale, sessionId } = {}) {
  await delay();
  const intent = matchIntent(message, locale);
  const messages = [
    createTextMessage({
      role: 'assistant',
      content: intent.reply,
    }),
  ];

  if (intent.card) {
    messages.push(
      createCardMessage({
        type: intent.cardType,
        card: intent.card,
      })
    );
  }

  return {
    sessionId: sessionId || 'mock-session-1',
    messages,
    suggestions: intent.suggestions || getWelcomeSuggestions(locale),
  };
}

export async function mockFetchChatHistory({ beforeId, limit = 10 } = {}) {
  await delay(400);

  let items = [...HISTORY_POOL];
  if (beforeId) {
    const index = items.findIndex((item) => item.id === beforeId);
    items = index >= 0 ? items.slice(0, index) : [];
  }

  const slice = items.slice(-limit);
  return {
    items: slice,
    hasMore: slice.length >= limit && items.length > limit,
    total: HISTORY_POOL.length + 1,
  };
}
