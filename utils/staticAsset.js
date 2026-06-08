/**
 * 解析 static 目录资源路径，兼容 App 端本地文件系统
 */
export function supportsSvgInImage() {
  // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
  return false;
  // #endif
  return true;
}

/** image 组件可用的图标路径：小程序等端自动将 .svg 映射为同目录 .png */
export function resolveIconPath(path = '') {
  if (!path) {
    return '';
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const rasterPath = supportsSvgInImage() ? normalized : normalized.replace(/\.svg$/i, '.png');
  return resolveStaticAsset(rasterPath);
}

export function resolveStaticAsset(path) {
  if (!path) {
    return '';
  }

  const normalized = path.startsWith('/') ? path : `/${path}`;

  // #ifdef APP-PLUS
  try {
    if (typeof plus !== 'undefined' && plus.io) {
      return plus.io.convertLocalFileSystemURL(`_www${normalized}`);
    }
  } catch (error) {
    // App 启动早期 plus 未就绪时回退默认路径
  }
  // #endif

  return normalized;
}
