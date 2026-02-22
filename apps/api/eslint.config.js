// @ts-check
const nestjs = require('@nexus/config/eslint/nestjs');

module.exports = [
  ...nestjs,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
  // Database schema files: snake_case index/constraint names + Drizzle self-referencing pattern
  {
    files: ['src/database/schema/**/*.ts'],
    rules: {
      'no-secrets/no-secrets': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // Drizzle infra repositories: result[0]! after DB queries is idiomatic Drizzle usage
  {
    files: [
      'src/database/**/*.ts',
      'src/modules/*/infra/**/*.ts',
      'src/modules/*/infra/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  // External bureau adapters/entities/mappers: raw JSON from external APIs
  {
    files: [
      'src/modules/credit/domain/**/*.ts',
      'src/modules/credit/bureaus/**/*.ts',
      'src/modules/credit/infra/mappers/**/*.ts',
      'src/modules/credit/use-cases/**/*.ts',
      'src/modules/clients/infra/excel-extraction.service.ts',
      'src/modules/clients/infra/mappers/**/*.ts',
      'src/modules/clients/infra/repositories/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
