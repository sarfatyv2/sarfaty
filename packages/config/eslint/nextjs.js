// @ts-check
const base = require('./base');

/** @type {import('typescript-eslint').Config} */
module.exports = [
  ...base,
  {
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },
];
