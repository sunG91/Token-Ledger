/**
 * 环境配置
 * 开发 / 生产通过 process.env.NODE_ENV 区分
 */

const ENV = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const configMap = {
  development: {
    baseUrl: 'http://localhost:3000/api/v1',
    timeout: 15000,
    useMock: true,
  },
  production: {
    baseUrl: 'https://api.tokenledger.example.com/api/v1',
    timeout: 15000,
    // 云端 API 尚未开放，打包版与开发版一致走本地/Mock 数据
    useMock: true,
  },
};

export default {
  env: ENV,
  ...configMap[ENV],
};
