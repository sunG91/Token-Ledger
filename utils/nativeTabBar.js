/**
 * 隐藏原生 tabBar（仅 H5 / App 需要；微信小程序走 custom-tab-bar 目录）
 */
export function hideNativeTabBar() {
  // #ifdef MP
  return;
  // #endif

  // #ifndef MP
  try {
    uni.hideTabBar({
      animation: false,
      fail() {},
    });
  } catch (error) {
    // ignore
  }
  // #endif
}
