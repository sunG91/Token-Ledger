module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recommended-scss',
    'stylelint-config-recommended-vue',
  ],
  rules: {
    // uni-app 使用 rpx/upx 单位
    'unit-no-unknown': [
      true,
      {
        ignoreUnits: ['rpx', 'upx'],
      },
    ],
    // 允许 Vue 深度选择器
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['deep', 'global'],
      },
    ],
    'selector-type-no-unknown': [
      true,
      {
        ignoreTypes: ['page', 'uni-page-body', 'uni-view', 'uni-text', 'uni-image'],
      },
    ],
    // 禁止将 scss @import 自动改成 url()，会导致 uni-app 编译失败
    'import-notation': null,
    // uView 要求 theme.scss / index.scss 带扩展名
    'scss/load-partial-extension': null,
    // 项目采用 BEM 命名（block__element--modifier）
    'selector-class-pattern': null,
    'declaration-property-value-no-unknown': [
      true,
      {
        ignoreProperties: {
          '/.*/': [
            '/\\d+rpx/',
            '/\\d+px/',
            '/\\$[\\w-]+/',
            '/^1rpx solid /',
            '/linear-gradient/',
            '/rgba?\\(/',
          ],
        },
      },
    ],
    'no-descending-specificity': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'color-function-notation': 'legacy',
    'alpha-value-notation': 'number',
  },
  ignoreFiles: ['node_modules/**', 'unpackage/**', 'dist/**', 'uni_modules/**', 'static/**'],
};
