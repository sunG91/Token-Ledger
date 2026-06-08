/**
 * 个人中心接口
 */
import http from '@/utils/request.js';
import config from '@/config/index.js';
import { fetchMockProfile } from '@/constants/mock/profile.js';
import { buildProfileSavingsData } from '@/utils/monthlyOverview.js';

function mergeProfileSavings(profile = {}) {
  const savings = buildProfileSavingsData();
  return {
    ...profile,
    monthlySavedTokens: savings.monthlySavedTokens,
    monthlyPlannedTokens: savings.monthlyPlannedTokens,
    monthlyConsumedTokens: savings.monthlyConsumedTokens,
    savingsRemark: savings.savingsRemark || profile.savingsRemark || '',
  };
}

export async function fetchProfile() {
  if (config.useMock) {
    const profile = await fetchMockProfile();
    return mergeProfileSavings(profile);
  }

  const res = await http.get('/profile');
  return mergeProfileSavings(res.data || {});
}
