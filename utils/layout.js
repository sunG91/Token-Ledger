/**
 * 布局测量工具 — 跨端计算首页各区域高度（px）
 */
import { getSafeAreaBottom, getWindowHeight } from '@/utils/system.js';

/** TabBar 默认高度（px），实测后会覆盖 */
export function getDefaultTabbarHeight() {
  return 50 + getSafeAreaBottom();
}

/** 测量 AI 对话消息区高度（px） */
export function measureAssistantBodyHeight(vm) {
  return new Promise((resolve) => {
    vm.$nextTick(() => {
      setTimeout(() => {
        const query = uni.createSelectorQuery().in(vm);
        query.select('.assistant-chat').boundingClientRect();
        query.select('.assistant-chat__footer').boundingClientRect();
        query.select('.assistant-header').boundingClientRect();
        query.exec((rects) => {
          const chatRect = rects[0];
          const footerRect = rects[1];
          const headerRect = rects[2];

          let bodyHeight = 200;
          if (chatRect && footerRect && headerRect) {
            bodyHeight = Math.max(
              Math.floor(chatRect.height - footerRect.height - headerRect.height),
              120
            );
          }
          resolve(bodyHeight);
        });
      }, 100);
    });
  });
}

/**
 * 测量元素高度（px）— 跨端布局，需在 DOM 渲染后调用
 * @param {Vue} vm 组件实例
 * @param {string} selector 选择器
 * @param {number} min 最小高度
 */
export function measureElementHeight(vm, selector, min = 80) {
  return new Promise((resolve) => {
    vm.$nextTick(() => {
      setTimeout(() => {
        const query = uni.createSelectorQuery().in(vm);
        query.select(selector).boundingClientRect();
        query.exec((rects) => {
          const rect = rects[0];
          resolve(rect?.height ? Math.max(Math.floor(rect.height), min) : min);
        });
      }, 80);
    });
  });
}

/**
 * 测量首页列表滚动区高度
 * @param {Vue} vm 页面实例
 * @returns {Promise<{ pageHeight: number, listScrollHeight: number, tabbarHeight: number, footerHeight: number }>}
 */
export function measureHomeLayout(vm) {
  return new Promise((resolve) => {
    const query = uni.createSelectorQuery().in(vm);
    query.select('.page-list-wrap').boundingClientRect();
    query.select('.recent-list__header').boundingClientRect();
    query.select('.page-footer-wrap').boundingClientRect();
    query.select('.page-tabbar-wrap').boundingClientRect();
    query.exec((rects) => {
      const listWrap = rects[0];
      const listHeader = rects[1];
      const footerWrap = rects[2];
      const tabbarWrap = rects[3];

      const pageHeight = getWindowHeight();
      const tabbarHeight = tabbarWrap?.height || getDefaultTabbarHeight();
      const footerHeight = footerWrap?.height || 0;
      const listHeaderMargin = uni.upx2px(24);

      let listScrollHeight = 200;
      if (listWrap && listHeader) {
        listScrollHeight = Math.max(
          Math.floor(listWrap.height - listHeader.height - listHeaderMargin),
          80
        );
      }

      resolve({
        pageHeight,
        listScrollHeight,
        tabbarHeight,
        footerHeight,
      });
    });
  });
}
