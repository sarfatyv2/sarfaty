// @ts-check
const base = require('./base');

/** @type {import('typescript-eslint').Config} */
module.exports = [
  ...base,
  {
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
];
