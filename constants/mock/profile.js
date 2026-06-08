/**
 * 个人中心 Mock 数据
 */

export const MOCK_PROFILE = {
  avatarEmoji: '📒',
  nickname: '小记账本',
  userId: 'token_2024',
  isPro: true,
  proExpireLabel: '2025-12-31 到期',
  lastBackupLabel: '今天 09:41',
  syncEnabled: true,
  monthlySaved: 45.2,
  monthlyBudget: 120.7,
  monthlyActual: 75.5,
};

export function fetchMockProfile() {
  return Promise.resolve({ ...MOCK_PROFILE });
}
