/**
 * ESLint 配置 — Token随手记 uni-app 跨端项目
 * 目标平台：Android / iOS / 微信小程序 / H5(Web)
 */
module.exports = {
  root: true,
  env: {
    node: true,
    es2020: true,
  },
  extends: ['plugin:vue/recommended', 'eslint:recommended', '@vue/eslint-config-prettier'],
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  globals: {
    // uni-app 全局 API
    uni: 'readonly',
    UniApp: 'readonly',
    getApp: 'readonly',
    getCurrentPages: 'readonly',
    // App 端
    plus: 'readonly',
    // 微信小程序
    wx: 'readonly',
    // 支付宝小程序
    my: 'readonly',
    // 条件编译标识（编译期处理，运行时不存在）
    __UNI_PLATFORM__: 'readonly',
  },
  rules: {
    // uni-app 页面/组件常用单词命名
    'vue/multi-word-component-names': 'off',
    // 跨端项目禁止直接操作 DOM（H5 专用代码用条件编译包裹）
    'no-restricted-globals': [
      'error',
      { name: 'document', message: '禁止直接使用 document，请用 uni API 或 #ifdef H5 条件编译' },
      { name: 'window', message: '禁止直接使用 window，请用 uni API 或 #ifdef H5 条件编译' },
      { name: 'localStorage', message: '请使用 uni.setStorageSync / uni.getStorageSync' },
      { name: 'sessionStorage', message: '请使用 uni.setStorageSync / uni.getStorageSync' },
    ],
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/prop-name-casing': ['error', 'camelCase'],
    'vue/require-default-prop': 'off',
    'vue/no-v-html': 'warn',
  },
  overrides: [
    {
      files: ['**/*.vue'],
      rules: {
        'vue/block-order': [
          'error',
          {
            order: ['template', 'script', 'style'],
          },
        ],
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'unpackage/',
    'dist/',
    '.hbuilderx/',
    'uni_modules/',
    'static/',
  ],
};
