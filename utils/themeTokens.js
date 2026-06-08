export function buildThemeCssVars(resolvedTheme, palette) {
  const isDark = resolvedTheme === 'dark';

  return {
    backgroundColor: palette.pageBg,
    color: isDark ? '#F1F2F6' : '#2D3436',
    '--app-page-bg': palette.pageBg,
    '--app-card-bg': isDark ? '#1F2030' : '#FFFFFF',
    '--app-muted-bg': isDark ? '#2A2B3D' : '#F1F2F6',
    '--app-text-primary': isDark ? '#F1F2F6' : '#2D3436',
    '--app-text-secondary': isDark ? '#A0A4B8' : '#636E72',
    '--app-text-placeholder': isDark ? '#6B7088' : '#B2BEC3',
    '--app-border-color': isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    '--app-shadow-card': isDark
      ? '0 4rpx 24rpx rgba(0, 0, 0, 0.28)'
      : '0 4rpx 24rpx rgba(108, 92, 231, 0.08)',
    '--app-gradient-highlight': isDark
      ? 'linear-gradient(145deg, #2A2850 0%, #1F2540 100%)'
      : 'linear-gradient(145deg, #EBE8FF 0%, #F5F3FF 100%)',
    '--app-surface-glass': isDark ? 'rgba(31, 32, 48, 0.92)' : 'rgba(255, 255, 255, 0.92)',
    '--app-tab-pill-bg': isDark ? 'rgba(31, 32, 48, 0.92)' : 'rgba(255, 255, 255, 0.88)',
    '--app-avatar-bg': isDark
      ? 'linear-gradient(135deg, rgba(108, 92, 231, 0.28) 0%, rgba(9, 132, 227, 0.2) 100%)'
      : 'linear-gradient(135deg, rgba(108, 92, 231, 0.15) 0%, rgba(9, 132, 227, 0.15) 100%)',
    '--app-icon-well': isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.55)',
    '--app-tab-bg': palette.tabBg,
    '--app-tab-active': palette.tabActive,
    '--app-tab-inactive': palette.tabInactive,
    '--app-tab-border': palette.tabBorder,
  };
}
