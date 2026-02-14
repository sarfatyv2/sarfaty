/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [require.resolve('./base'), 'next/core-web-vitals'],
  rules: {
    '@typescript-eslint/no-floating-promises': 'off',
    'react/no-unescaped-entities': 'off',
  },
};
