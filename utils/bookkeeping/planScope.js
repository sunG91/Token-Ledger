/**
 * 月度额度计划作用域解析（公用池 vs 模型专属）
 */
import { MONTHLY_PLAN_SCOPE } from '@/constants/monthlyOverview.js';

const TOTAL_HINT_RE =
  /总额|总预算|总计划|总余额|公用|合计|总共|整体|全局|overall|total\s*(budget|quota|plan|balance)/i;
const MODEL_SPECIFIC_RE = /模型计划|专属计划|该模型|这个模型|model\s*plan/i;

export function resolveSetPlanScope(args = {}) {
  const explicit = String(args.target_scope || args.scope || '')
    .trim()
    .toLowerCase();
  if (explicit === MONTHLY_PLAN_SCOPE.MODEL) {
    return MONTHLY_PLAN_SCOPE.MODEL;
  }
  if (explicit === MONTHLY_PLAN_SCOPE.SHARED) {
    return MONTHLY_PLAN_SCOPE.SHARED;
  }

  const desc = [args.user_description, args.reason, args.platform_name]
    .filter(Boolean)
    .join(' ');
  if (TOTAL_HINT_RE.test(desc)) {
    return MONTHLY_PLAN_SCOPE.SHARED;
  }

  const modelName = String(args.model_name || '').trim();
  const platformId = String(args.platform_id || '').trim();
  if (!modelName && !platformId) {
    return MONTHLY_PLAN_SCOPE.SHARED;
  }
  if (modelName && MODEL_SPECIFIC_RE.test(desc)) {
    return MONTHLY_PLAN_SCOPE.MODEL;
  }
  if (modelName) {
    return MONTHLY_PLAN_SCOPE.MODEL;
  }
  return MONTHLY_PLAN_SCOPE.SHARED;
}

export function resolveAdjustPlanScope(args = {}) {
  const explicit = String(args.target_scope || args.scope || '')
    .trim()
    .toLowerCase();
  if (explicit === MONTHLY_PLAN_SCOPE.MODEL) {
    return MONTHLY_PLAN_SCOPE.MODEL;
  }
  if (explicit === MONTHLY_PLAN_SCOPE.SHARED) {
    return MONTHLY_PLAN_SCOPE.SHARED;
  }

  const desc = [args.user_description, args.reason, args.platform_name]
    .filter(Boolean)
    .join(' ');
  if (MODEL_SPECIFIC_RE.test(desc) || args.model_specific) {
    return MONTHLY_PLAN_SCOPE.MODEL;
  }

  const tokenDelta = Number(args.token_delta) || 0;
  const modelName = String(args.model_name || '').trim();

  if (tokenDelta < 0) {
    return MONTHLY_PLAN_SCOPE.SHARED;
  }

  if (TOTAL_HINT_RE.test(desc) || !modelName) {
    return MONTHLY_PLAN_SCOPE.SHARED;
  }
  return MONTHLY_PLAN_SCOPE.MODEL;
}
