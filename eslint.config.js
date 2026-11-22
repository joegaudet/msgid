import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['**/dist/**', '**/*.d.ts', 'docs/api/**', 'docs/api-md/**', '_site/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: { project: './tsconfig.tools.json', tsconfigRootDir: import.meta.dirname },
      globals: { console: 'readonly', fetch: 'readonly', process: 'readonly', URL: 'readonly' },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
)
