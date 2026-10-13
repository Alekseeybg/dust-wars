import js from '@eslint/js';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import pluginQuasar from '@quasar/app-vite/eslint';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import prettierSkipFormatting from '@vue/eslint-config-prettier/skip-formatting';

export default defineConfigWithVueTs(
  { ignores: ['.tmp/**'] },
  pluginQuasar.configs.recommended(),
  js.configs.recommended,
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      'vue/v-slot-style': ['warn', 'shorthand'],
      'vue/multi-word-component-names': 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    },
  },
  {
    files: ['src/domain/**/*.ts', 'src/data/**/*.ts', 'src/utils/**/*.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'vue',
                'vue/*',
                'pinia',
                'quasar',
                'stores',
                'stores/**',
                '**/stores',
                '**/stores/**',
                'components',
                'components/**',
                '**/components',
                '**/components/**',
                'pages',
                'pages/**',
                '**/pages',
                '**/pages/**',
                'layouts',
                'layouts/**',
                '**/layouts',
                '**/layouts/**',
                'services',
                'services/**',
                '**/services',
                '**/services/**',
              ],
              message:
                'Keep domain, data and utilities independent of UI, stores and browser services.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/domain/**/*.ts', 'src/data/**/*.ts', 'src/utils/**/*.ts'],
    rules: {
      'no-restricted-globals': ['error', 'window', 'document', 'localStorage', 'sessionStorage'],
    },
  },
  {
    files: ['tests/**/*.mjs'],
    extends: [vueTsConfigs.disableTypeChecked],
    languageOptions: { globals: globals.node },
  },
  prettierSkipFormatting,
);
