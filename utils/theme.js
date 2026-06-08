import { THEME_MODES } from '@/constants/settings.js';
import { invalidateSystemInfoCache } from '@/utils/system.js';
import { buildThemeCssVars } from '@/utils/themeTokens.js';

const THEME_COLORS = {
  light: {
    pageBg: '#F8F9FE',
    navFront: '#000000',
    navBg: '#F8F9FE',
    tabBg: '#FFFFFF',
    tabActive: '#6C5CE7',
    tabInactive: '#636E72',
    tabBorder: 'rgba(0, 0, 0, 0.06)',
  },
  dark: {
    pageBg: '#151522',
    navFront: '#ffffff',
    navBg: '#151522',
    tabBg: '#1F2030',
    tabActive: '#A29BFE',
    tabInactive: '#A0A4B8',
    tabBorder: 'rgba(255, 255, 255, 0.08)',
  },
};

let h5ThemeMedia = null;
let h5ThemeMediaHandler = null;

export function getSystemTheme() {
  invalidateSystemInfoCache();

  try {
    const info = uni.getSystemInfoSync();
    if (info.theme === 'dark' || info.osTheme === 'dark') {
      return THEME_MODES.DARK;
    }
    if (info.theme === 'light' || info.osTheme === 'light') {
      return THEME_MODES.LIGHT;
    }
  } catch (error) {
    // ignore
  }

  // #ifdef H5
  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? THEME_MODES.DARK
        : THEME_MODES.LIGHT;
    }
  } catch (error) {
    // ignore
  }
  // #endif

  return THEME_MODES.LIGHT;
}

export function resolveThemeMode(themeMode, systemTheme) {
  if (themeMode === THEME_MODES.LIGHT || themeMode === THEME_MODES.DARK) {
    return themeMode;
  }
  return systemTheme || getSystemTheme();
}

export function getThemePalette(resolvedTheme) {
  return resolvedTheme === THEME_MODES.DARK ? THEME_COLORS.dark : THEME_COLORS.light;
}

export function getThemePageClass(resolvedTheme) {
  return resolvedTheme === THEME_MODES.DARK ? 'theme-dark-page' : 'theme-light-page';
}

/** 将 CSS 变量注入 page / body 根节点，避免仅内层 .page 有变量时底层仍用浅色 fallback */
export function injectGlobalThemeVars(resolvedTheme) {
  const palette = getThemePalette(resolvedTheme);
  const vars = buildThemeCssVars(resolvedTheme, palette);
  const isDark = resolvedTheme === THEME_MODES.DARK;
  const varCss = Object.keys(vars)
    .filter((key) => key !== 'backgroundColor' && key !== 'color')
    .map((key) => `${key}: ${vars[key]};`)
    .join('\n      ');

  const css = `
    :root,
    page,
    uni-page-body,
    uni-page-wrapper,
    body {
      ${varCss}
      background-color: ${palette.pageBg} !important;
      color: ${vars.color};
    }
  `;

  if (typeof document !== 'undefined') {
    const id = 'app-global-theme-vars';
    let styleEl = document.getElementById(id);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = id;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;

    const root = document.documentElement;
    root.classList.toggle('theme-dark-root', isDark);
    root.classList.toggle('theme-light-root', !isDark);
    root.setAttribute('data-theme', resolvedTheme);
    root.style.backgroundColor = palette.pageBg;
    document.body.style.backgroundColor = palette.pageBg;
  }

  return palette;
}

function applyPageBackgroundResolved(resolvedTheme) {
  const palette = getThemePalette(resolvedTheme);
  const pageBg = palette.pageBg;

  // #ifdef APP-PLUS
  try {
    const pages = getCurrentPages();
    pages.forEach((page) => {
      const webview = page?.$getAppWebview?.();
      if (webview?.setStyle) {
        webview.setStyle({
          background: pageBg,
          backgroundColor: pageBg,
        });
      }
    });
  } catch (error) {
    // ignore
  }
  // #endif

  // #ifdef H5
  if (typeof document !== 'undefined') {
    document.documentElement.style.backgroundColor = pageBg;
    document.body.style.backgroundColor = pageBg;
  }
  // #endif

  return pageBg;
}

/** 将当前页面（及栈内页面）底层 WebView 背景设为与主题一致 */
export function applyPageBackground(themeMode, systemTheme) {
  return applyPageBackgroundResolved(resolveThemeMode(themeMode, systemTheme));
}

export function applyNavigationTheme(resolvedTheme) {
  const palette = getThemePalette(resolvedTheme);
  try {
    uni.setNavigationBarColor({
      frontColor: palette.navFront,
      backgroundColor: palette.navBg,
      animation: {
        duration: 0,
        timingFunc: 'linear',
      },
    });
  } catch (error) {
    // 自定义导航栏页面可能不支持，忽略即可
  }
}

export function applyGlobalTheme(resolvedTheme) {
  const palette = getThemePalette(resolvedTheme);
  const isDark = resolvedTheme === THEME_MODES.DARK;

  injectGlobalThemeVars(resolvedTheme);
  applyNavigationTheme(resolvedTheme);

  // #ifdef MP
  try {
    uni.setBackgroundColor({
      backgroundColor: palette.pageBg,
      backgroundColorTop: palette.pageBg,
      backgroundColorBottom: palette.pageBg,
    });
  } catch (error) {
    // 部分小程序端不支持，忽略
  }
  // #endif

  // #ifdef APP-PLUS
  try {
    if (typeof plus !== 'undefined' && plus.navigator) {
      plus.navigator.setStatusBarStyle(isDark ? 'light' : 'dark');
    }
  } catch (error) {
    // ignore
  }
  // #endif

  applyPageBackgroundResolved(resolvedTheme);

  return palette;
}

export function watchSystemThemeChange(callback) {
  if (typeof callback !== 'function') {
    return null;
  }

  let disposed = false;

  const notify = () => {
    if (!disposed) {
      callback();
    }
  };

  if (typeof uni.onThemeChange === 'function') {
    uni.onThemeChange(notify);
  }

  // #ifdef H5
  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      h5ThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
      h5ThemeMediaHandler = () => notify();
      if (typeof h5ThemeMedia.addEventListener === 'function') {
        h5ThemeMedia.addEventListener('change', h5ThemeMediaHandler);
      } else if (typeof h5ThemeMedia.addListener === 'function') {
        h5ThemeMedia.addListener(h5ThemeMediaHandler);
      }
    }
  } catch (error) {
    // ignore
  }
  // #endif

  return () => {
    disposed = true;
    if (typeof uni.offThemeChange === 'function') {
      uni.offThemeChange(notify);
    }
    // #ifdef H5
    if (h5ThemeMedia && h5ThemeMediaHandler) {
      if (typeof h5ThemeMedia.removeEventListener === 'function') {
        h5ThemeMedia.removeEventListener('change', h5ThemeMediaHandler);
      } else if (typeof h5ThemeMedia.removeListener === 'function') {
        h5ThemeMedia.removeListener(h5ThemeMediaHandler);
      }
      h5ThemeMedia = null;
      h5ThemeMediaHandler = null;
    }
    // #endif
  };
}
