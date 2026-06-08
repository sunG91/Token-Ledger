/**
 * 内置金额换算器（余额差分 + token 累加校准）— 用户不可见
 */
export const COST_CALIBRATION_STORAGE_PREFIX = 'cost_calibration_';

/** 每个 apiKey+model 保留的最近校准样本数 */
export const COST_CALIBRATION_MAX_SAMPLES = 8;

/** 参与换算的最小 token 数 */
export const COST_CALIBRATION_MIN_TOKENS = 1;

/** 余额变化低于此值视为「未扣费」 */
export const COST_CALIBRATION_BALANCE_EPSILON = 0.0001;
