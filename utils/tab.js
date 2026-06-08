import { SETTINGS_STORAGE_KEYS } from '@/constants/settings.js';
import { hideNativeTabBar } from '@/utils/nativeTabBar.js';
import { getStorageItem, setStorageItem } from '@/utils/storage.js';

/**
 * Tab 页导航配置（pages.json tabBar + switchTab，三端缓存 Tab 页）
 */
export const TAB_LIST = [
  {
    name: 'home',
    pagePath: '/pages/index/index',
    icon: 'home',
  },
  {
    name: 'records',
    pagePath: '/pages/records/index',
    icon: 'file-text',
  },
  {
    name: 'bills',
    pagePath: '/pages/bills/index',
    icon: 'order',
  },
  {
    name: 'stats',
    pagePath: '/pages/stats/index',
    icon: 'grid',
  },
  {
    name: 'profile',
    pagePath: '/pages/profile/index',
    icon: 'account',
  },
];

const DEFAULT_TAB_PATH = TAB_LIST[0].pagePath;

const TAB_PATH_MAP = TAB_LIST.reduce((map, item) => {
  map[item.pagePath] = item.name;
  map[item.pagePath.replace(/^\//, '')] = item.name;
  return map;
}, {});

let hasRestoredLastTab = false;
let isRestoringLastTab = false;

function normalizeTabPath(pagePath = '') {
  const raw = String(pagePath).trim();
  if (!raw) {
    return '';
  }
  const url = raw.startsWith('/') ? raw : `/${raw}`;
  return TAB_LIST.find((item) => item.pagePath === url)?.pagePath || '';
}

/** 持久化用户最后停留的 Tab（刷新 / 冷启动后恢复） */
export function saveLastTabPath(pagePath) {
  const normalized = normalizeTabPath(pagePath);
  if (!normalized) {
    return;
  }
  // 冷启动会先落到首页，避免在恢复完成前把记忆覆盖成首页
  if (isRestoringLastTab && normalized === DEFAULT_TAB_PATH) {
    return;
  }
  setStorageItem(SETTINGS_STORAGE_KEYS.LAST_TAB, normalized);
}

export function getLastTabPath() {
  const saved = getStorageItem(SETTINGS_STORAGE_KEYS.LAST_TAB, DEFAULT_TAB_PATH);
  return normalizeTabPath(saved) || DEFAULT_TAB_PATH;
}

function getCurrentTabPath() {
  const pages = getCurrentPages();
  if (!pages.length) {
    return '';
  }
  const route = pages[pages.length - 1]?.route;
  return route ? normalizeTabPath(route) : '';
}

function notifyTabChanged() {
  hideNativeTabBar();
  uni.$emit('app-tab-changed');
}

/** 切换到 Tab 页（使用原生 Tab 缓存，避免 reLaunch 整页重建） */
export function switchTab(pagePath) {
  const url = normalizeTabPath(pagePath);
  if (!url) {
    return;
  }

  saveLastTabPath(url);
  uni.switchTab({
    url,
    success: notifyTabChanged,
    fail: () => {
      hideNativeTabBar();
    },
  });
}

/**
 * 冷启动 / 刷新后恢复上次 Tab（仅执行一次）
 * H5 / App / 微信小程序均通过 storage 读取
 */
export function restoreLastTab() {
  if (hasRestoredLastTab) {
    return;
  }
  hasRestoredLastTab = true;

  const target = getLastTabPath();
  if (!target || target === DEFAULT_TAB_PATH) {
    return;
  }

  const current = getCurrentTabPath();
  if (current === target) {
    return;
  }

  isRestoringLastTab = true;

  const finishRestore = () => {
    isRestoringLastTab = false;
  };

  const apply = () => {
    uni.switchTab({
      url: target,
      success: () => {
        notifyTabChanged();
        finishRestore();
      },
      fail: finishRestore,
    });
  };

  // 等待 Tab 页注册完成，各端延迟略有差异
  // #ifdef MP
  setTimeout(apply, 80);
  // #endif
  // #ifdef APP-PLUS
  setTimeout(apply, 30);
  // #endif
  // #ifdef H5
  setTimeout(apply, 0);
  // #endif
}

/** 根据当前路由获取 Tab name */
export function getCurrentTabName() {
  const pages = getCurrentPages();
  if (!pages.length) return 'home';
  const route = pages[pages.length - 1].route;
  return TAB_PATH_MAP[route] || 'home';
}

export function isTabPagePath(pagePath = '') {
  return !!normalizeTabPath(pagePath);
}
