/**
 * 跨端本地持久化（H5 / iOS / Android）
 * uni.storage 为主，H5 隐私模式等场景回退 localStorage
 */

function readLocalStorage(key) {
  // #ifdef H5
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch (error) {
    // ignore
  }
  // #endif
  return null;
}

function writeLocalStorage(key, value) {
  // #ifdef H5
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return true;
    }
  } catch (error) {
    // ignore
  }
  // #endif
  return false;
}

function removeLocalStorage(key) {
  // #ifdef H5
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      return true;
    }
  } catch (error) {
    // ignore
  }
  // #endif
  return false;
}

export function getStorageItem(key, defaultValue = '') {
  if (!key) {
    return defaultValue;
  }

  try {
    const value = uni.getStorageSync(key);
    if (value === '' || value === undefined || value === null) {
      const fallback = readLocalStorage(key);
      if (fallback === null || fallback === '') {
        return defaultValue;
      }
      return fallback;
    }
    return value;
  } catch (error) {
    const fallback = readLocalStorage(key);
    if (fallback === null || fallback === '') {
      return defaultValue;
    }
    return fallback;
  }
}

export function setStorageItem(key, value) {
  if (!key) {
    return false;
  }

  const text = String(value);
  let saved = false;
  try {
    uni.setStorageSync(key, text);
    saved = true;
  } catch (error) {
    saved = false;
  }

  // #ifdef H5
  if (saved) {
    writeLocalStorage(key, text);
  }
  // #endif

  if (!saved) {
    saved = writeLocalStorage(key, text);
  }

  return saved;
}

/** 写入自检：Web / iOS / Android / 小程序均走 uni.storage */
export function verifyStorageWritable() {
  const probeKey = '__token_storage_probe__';
  const probeVal = String(Date.now());
  const saved = setStorageItem(probeKey, probeVal);
  if (!saved) {
    return false;
  }
  const read = getStorageItem(probeKey, '');
  removeStorageItem(probeKey);
  return read === probeVal;
}

/** 判断 key 在 uni.storage 与 H5 localStorage 回退层是否均已为空 */
export function isStorageEmpty(key) {
  if (!key) {
    return true;
  }

  try {
    const value = uni.getStorageSync(key);
    if (value !== '' && value !== undefined && value !== null) {
      return false;
    }
  } catch (error) {
    // ignore
  }

  const fallback = readLocalStorage(key);
  return fallback === null || fallback === '';
}

export function removeStorageItem(key) {
  if (!key) {
    return false;
  }

  let removed = false;
  try {
    uni.removeStorageSync(key);
    removed = true;
  } catch (error) {
    removed = false;
  }

  // #ifdef H5
  if (removeLocalStorage(key)) {
    removed = true;
  }
  // #endif

  return removed;
}

/** 删除并校验两端存储均已清空 */
export function purgeStorageItem(key) {
  if (!key) {
    return false;
  }
  if (isStorageEmpty(key)) {
    return true;
  }

  removeStorageItem(key);
  if (isStorageEmpty(key)) {
    return true;
  }

  try {
    uni.setStorageSync(key, '');
  } catch (error) {
    // ignore
  }
  removeLocalStorage(key);
  return isStorageEmpty(key);
}

export function readBoolean(value, defaultValue = false) {
  if (value === '' || value === undefined || value === null) {
    return defaultValue;
  }
  if (value === true || value === 'true' || value === 1 || value === '1') {
    return true;
  }
  if (value === false || value === 'false' || value === 0 || value === '0') {
    return false;
  }
  return defaultValue;
}
