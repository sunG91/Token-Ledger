/**
 * AI 助手 Tools 名称（口语记账 + 余额查询等）
 */
export const ASSISTANT_TOOL_NAMES = {
  CONFIRM_RECORD: 'confirm_voice_record',
  SAVE_PENDING: 'save_pending_record',
  LIST_INCOMPLETE: 'list_incomplete_records',
  QUERY_BALANCE: 'query_api_key_balance',
  LIST_PLATFORM_KEYS: 'list_platform_bound_keys',
  QUERY_USAGE: 'query_model_usage',
  GET_RANKING: 'get_usage_ranking',
  GET_REPORT: 'get_period_usage_report',
  COMPARE_PLATFORMS: 'compare_platform_costs',
  LIST_BILL_RECORDS: 'list_bill_records',
  SET_MONTHLY_PLAN: 'set_monthly_plan',
  ADJUST_MONTHLY_QUOTA: 'adjust_monthly_quota',
  GET_MONTHLY_QUOTA: 'get_monthly_quota_status',
};

/** @deprecated 使用 ASSISTANT_TOOL_NAMES */
export const BOOKKEEPING_TOOL_NAMES = ASSISTANT_TOOL_NAMES;
