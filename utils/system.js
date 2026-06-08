/**
 * 系统信息工具 — 跨端安全区与导航栏高度
 */

let systemInfo = null;

export function invalidateSystemInfoCache() {
  systemInfo = null;
}

export function getSystemInfo() {
  if (!systemInfo) {
    systemInfo = uni.getSystemInfoSync();
  }
  return systemInfo;
}

/** 状态栏高度（px） */
export function getStatusBarHeight() {
  return getSystemInfo().statusBarHeight || 0;
}

/** 自定义导航栏内容区高度（px），不含状态栏 */
export function getNavContentHeight() {
  return 44;
}

/** 自定义导航栏总高度 = 状态栏 + 内容区 */
export function getNavBarHeight() {
  return getStatusBarHeight() + getNavContentHeight();
}

/** 底部安全区高度（px） */
export function getSafeAreaBottom() {
  const info = getSystemInfo();
  if (info.safeAreaInsets && info.safeAreaInsets.bottom) {
    return info.safeAreaInsets.bottom;
  }
  // 部分端只有 safeArea
  if (info.safeArea && info.screenHeight) {
    return info.screenHeight - info.safeArea.bottom;
  }
  return 0;
}

/** 可用窗口高度（px） */
export function getWindowHeight() {
  return getSystemInfo().windowHeight || 0;
}

/** 可用窗口宽度（px） */
export function getWindowWidth() {
  return getSystemInfo().windowWidth || 0;
}
