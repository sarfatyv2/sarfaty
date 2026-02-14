/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [require.resolve('./base')],
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
  },
};
