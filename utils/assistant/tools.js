/**
 * AI 助手 OpenAI Tools（口语记账 + API 余额查询）
 */
import { ASSISTANT_TOOL_NAMES } from '@/constants/assistantTools.js';
import { BOOKKEEPING_PENDING_STATUS } from '@/constants/bookkeeping.js';

function toolDef(name, description, parameters) {
  return {
    type: 'function',
    function: {
      name,
      description,
      parameters,
    },
  };
}

export function buildAssistantTools(locale = 'zh-CN') {
  const isEn = locale === 'en-US';

  return [
    toolDef(
      ASSISTANT_TOOL_NAMES.CONFIRM_RECORD,
      isEn
        ? 'Call when you have enough info to save a token usage record. platform_id is required; model_name only when user explicitly named a model. Match vendor against bound list; use platform_id "other" if vendor is not bound.'
        : '当已掌握足够信息可入账时调用。platform_id 必填；仅当用户明确说了模型时才填 model_name。厂商须匹配已绑定列表，未绑定用 platform_id=other。',
      {
        type: 'object',
        properties: {
          api_key_id: {
            type: 'string',
            description: isEn
              ? 'Matched apiKeyId from bound list; empty if logging to Other'
              : '匹配到的 apiKeyId（记到「其他」时留空）',
          },
          platform_id: {
            type: 'string',
            description: isEn ? 'Platform id from bound list or "other"' : '平台 id 或 other',
          },
          model_name: {
            type: 'string',
            description: isEn
              ? 'Optional. Only when user explicitly named the model; omit for vendor-only logs (e.g. "DeepSeek used 5k tokens").'
              : '可选。仅当用户明确说了模型时填写；仅口述厂商（如「DeepSeek 用了 5k」）时可省略。',
          },
          token_count: {
            type: 'number',
            description: isEn ? 'Token count used' : '消耗 token 数',
          },
          scenario: {
            type: 'string',
            description: isEn
              ? 'Optional usage scenario for banter'
              : '可选使用场景（可轻松调侃一句）',
          },
          alias_hint: {
            type: 'string',
            description: isEn
              ? 'Optional alias/remark hint from user speech'
              : '用户口述的备注/别名线索（辅助匹配）',
          },
        },
        required: ['platform_id', 'token_count'],
      }
    ),
    toolDef(
      ASSISTANT_TOOL_NAMES.SAVE_PENDING,
      isEn
        ? 'Call when user wants to log usage but model name or token count is still missing.'
        : '用户想记账但还缺模型或用量时调用，写入待补全长记忆。',
      {
        type: 'object',
        properties: {
          platform_id: { type: 'string' },
          platform_name: { type: 'string' },
          model_name: { type: 'string' },
          api_key_id: { type: 'string' },
          alias_hint: { type: 'string' },
          scenario: { type: 'string' },
          missing_field: {
            type: 'string',
            enum: ['model', 'tokens'],
          },
        },
        required: ['platform_id', 'missing_field'],
      }
    ),
    toolDef(
      ASSISTANT_TOOL_NAMES.LIST_INCOMPLETE,
      isEn
        ? 'Call when user asks which records are incomplete or not fully logged yet.'
        : '用户问还有哪些账没记全、待补全时调用。',
      {
        type: 'object',
        properties: {},
      }
    ),
    toolDef(
      ASSISTANT_TOOL_NAMES.LIST_PLATFORM_KEYS,
      isEn
        ? 'Call when user asks API balance but only names a vendor/platform and multiple keys exist under that platform. Lists bound keys with alias and model for user to pick.'
        : '用户只说了厂商要问余额、且该厂商下对接了多个 Key 时调用，列出备注/模型供用户继续选择。',
      {
        type: 'object',
        properties: {
          platform_id: {
            type: 'string',
            description: isEn
              ? 'Platform id such as deepseek, openai'
              : '厂商 platform id，如 deepseek',
          },
        },
        required: ['platform_id'],
      }
    ),
    toolDef(
      ASSISTANT_TOOL_NAMES.QUERY_USAGE,
      isEn
        ? 'Call when user asks token usage/cost for a model or platform in a time period (today, yesterday, week, month).'
        : '用户问某模型/厂商在指定时间段（今天/昨天/本周/本月）的 token 用量或费用时调用。',
      {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['today', 'yesterday', 'week', 'month'],
          },
          platform_id: { type: 'string' },
          platform_name: { type: 'string' },
          model_name: { type: 'string' },
          api_key_id: { type: 'string' },
        },
      }
    ),
    toolDef(
      ASSISTANT_TOOL_NAMES.GET_RANKING,
      isEn
        ? 'Call for model/platform usage ranking or "which model used the most" questions.'
        : '用户问消耗排行、哪个模型用得最多、模型用量排行时调用。',
      {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['today', 'yesterday', 'week', 'month'],
          },
          group_by: {
            type: 'string',
            enum: ['model', 'platform'],
          },
          limit: { type: 'number' },
        },
      }
    ),
    toolDef(
      ASSISTANT_TOOL_NAMES.GET_REPORT,
      isEn
        ? 'Call for weekly/monthly usage report. Returns internal chat usage vs external user bookkeeping by vendor (tokens only).'
        : '用户要月度/周度使用报告时调用。返回 internal 助手对话消耗、external 用户口述记账及各厂商 token，不含金额。',
      {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['week', 'month'],
          },
        },
      }
    ),
    toolDef(
      ASSISTANT_TOOL_NAMES.COMPARE_PLATFORMS,
      isEn
        ? 'Call when user wants token usage comparison across their connected vendors/platforms.'
        : '用户要各对接厂商/平台 token 用量对比时调用（仅统计已对接厂商）。',
      {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['today', 'yesterday', 'week', 'month'],
          },
        },
      }
    ),
    toolDef(
      ASSISTANT_TOOL_NAMES.LIST_BILL_RECORDS,
      isEn
        ? 'Call when user wants bill details/export summary for a period.'
        : '用户要导出账单明细、查看某时段记账明细时调用。',
      {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['today', 'yesterday', 'week', 'month'],
          },
        },
      }
    ),
    toolDef(
      ASSISTANT_TOOL_NAMES.QUERY_BALANCE,
      isEn
        ? 'Call when user asks how much balance is left on a connected API key. Match by api_key_id, alias_hint, user_description (remark), or platform_id+model_name from bound list.'
        : '用户询问已对接 API 还剩多少余额时调用。可用 api_key_id、备注别名 alias_hint、user_description 或 platform_id+model_name 语义匹配。',
      {
        type: 'object',
        properties: {
          api_key_id: {
            type: 'string',
            description: isEn ? 'Exact apiKeyId if already resolved' : '已明确时的 apiKeyId',
          },
          alias_hint: {
            type: 'string',
            description: isEn
              ? 'User-mentioned alias/remark label on the key'
              : '用户提到的 Key 备注/别名',
          },
          user_description: {
            type: 'string',
            description: isEn
              ? 'Free-form user wording to match alias/platform/model'
              : '用户自由描述，用于匹配备注/厂商/模型',
          },
          platform_id: {
            type: 'string',
            description: isEn ? 'Vendor platform id' : '厂商 platform id',
          },
          model_name: {
            type: 'string',
            description: isEn ? 'Chat model on the key' : 'Key 绑定的对话模型',
          },
        },
      }
    ),
    toolDef(
      ASSISTANT_TOOL_NAMES.SET_MONTHLY_PLAN,
      isEn
        ? 'Call when user declares monthly planned token budget. Total/overall quota → scope=shared. Per-model plan → scope=model with platform_id+model_name.'
        : '用户口述本月计划用量时调用。总额度/公用预算 → scope=shared；某模型专属计划 → scope=model 并带 platform_id+model_name。',
      {
        type: 'object',
        properties: {
          scope: {
            type: 'string',
            enum: ['shared', 'model'],
            description: isEn
              ? 'shared=overall monthly pool; model=per-model plan'
              : 'shared=本月公用总额度；model=模型专属计划',
          },
          platform_id: { type: 'string' },
          platform_name: { type: 'string' },
          model_name: { type: 'string' },
          api_key_id: { type: 'string' },
          alias_hint: { type: 'string' },
          user_description: { type: 'string' },
          planned_tokens: { type: 'number' },
          month_key: {
            type: 'string',
            description: isEn ? 'YYYY-MM, default current month' : 'YYYY-MM，默认当月',
          },
        },
        required: ['planned_tokens'],
      }
    ),
    toolDef(
      ASSISTANT_TOOL_NAMES.ADJUST_MONTHLY_QUOTA,
      isEn
        ? 'Deduct/add monthly planned quota. Vendor budget deduction (e.g. "deduct 200k from DeepSeek") → scope=shared. Model-specific adjustment → scope=model.'
        : '扣减/追加本月计划额度。厂商扣预算（如 deepseek 扣 20 万）→ scope=shared；模型专属调整 → scope=model。',
      {
        type: 'object',
        properties: {
          scope: {
            type: 'string',
            enum: ['shared', 'model'],
            description: isEn
              ? 'shared=deduct from overall pool; model=adjust specific model plan'
              : 'shared=从公用总额度扣减；model=调整模型专属计划',
          },
          platform_id: { type: 'string' },
          platform_name: { type: 'string' },
          model_name: { type: 'string' },
          api_key_id: { type: 'string' },
          alias_hint: { type: 'string' },
          user_description: { type: 'string' },
          model_specific: {
            type: 'boolean',
            description: isEn
              ? 'True when user explicitly targets a model plan entry'
              : '用户明确要调整某模型专属计划时为 true',
          },
          token_delta: { type: 'number' },
          reason: { type: 'string' },
          month_key: { type: 'string' },
        },
        required: ['token_delta'],
      }
    ),
    toolDef(
      ASSISTANT_TOOL_NAMES.GET_MONTHLY_QUOTA,
      isEn
        ? 'Call when user asks remaining monthly quota, planned usage, or how much budget is left this month.'
        : '用户问本月还剩多少额度、计划用量、总额度时调用。',
      {
        type: 'object',
        properties: {
          month_key: { type: 'string' },
        },
      }
    ),
  ];
}

export function mapMissingFieldToStatus(missingField = '') {
  return missingField === 'model'
    ? BOOKKEEPING_PENDING_STATUS.AWAITING_MODEL
    : BOOKKEEPING_PENDING_STATUS.AWAITING_TOKENS;
}

/** @deprecated 使用 buildAssistantTools */
export function buildBookkeepingTools(locale) {
  return buildAssistantTools(locale);
}
