/**
 * 网络请求封装 — 基于 luch-request，跨端兼容
 */
import Request from 'luch-request';
import config from '@/config/index.js';

const http = new Request({
  baseURL: config.baseUrl,
  timeout: config.timeout,
  header: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截：注入 Token
http.interceptors.request.use(
  (options) => {
    const token = uni.getStorageSync('token');
    if (token) {
      options.header = {
        ...options.header,
        Authorization: `Bearer ${token}`,
      };
    }
    return options;
  },
  (error) => Promise.reject(error)
);

// 响应拦截：统一错误处理
http.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data && data.code !== undefined && data.code !== 0) {
      const message = data.message || '请求失败';
      if (data.code === 40101) {
        uni.removeStorageSync('token');
        uni.showToast({ title: '请重新登录', icon: 'none' });
      } else {
        uni.showToast({ title: message, icon: 'none' });
      }
      return Promise.reject(new Error(message));
    }
    return data;
  },
  (error) => {
    const message = error?.errMsg || error?.message || '网络异常';
    uni.showToast({ title: message, icon: 'none' });
    return Promise.reject(error);
  }
);

export default http;
