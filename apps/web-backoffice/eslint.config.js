// @ts-check
const nextPlugin = require('@next/eslint-plugin-next');
const nextjs = require('@nexus/config/eslint/nextjs');

module.exports = [
  ...nextjs,
  {
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
];
