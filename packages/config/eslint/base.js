// @ts-check
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-config-prettier');
const security = require('eslint-plugin-security');
const noSecrets = require('eslint-plugin-no-secrets');

/** @type {import('typescript-eslint').Config} */
module.exports = [
  { ignores: ['dist/**', 'node_modules/**', '.turbo/**', 'coverage/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      security,
      'no-secrets': noSecrets,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      'no-console': 'warn',
      'no-secrets/no-secrets': 'error',
      'security/detect-object-injection': 'off',
    },
  },
  prettier,
];
