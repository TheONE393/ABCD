import eslintPluginAstro from 'eslint-plugin-astro';
import tsParser from '@typescript-eslint/parser';

export default [
  // Recommended configuration for Astro components and projects
  ...eslintPluginAstro.configs.recommended,
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: eslintPluginAstro.parser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.astro'],
        sourceType: 'module',
      },
    },
    rules: {
      // Sensible default rules
      'astro/no-set-html-directive': 'warn',
    },
  },
  {
    // Global ignore patterns
    ignores: ['dist/**', '.astro/**', 'node_modules/**', '.vscode/**'],
  },
];
