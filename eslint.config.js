import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config({
  extends: [js.configs.recommended, ...tseslint.configs.recommended],
  files: ['**/*.{ts,tsx}'],
  ignores: ['dist'],
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser,
  },
  plugins: {
    'react-hooks': reactHooks,
    'react-refresh': reactRefresh,
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // My custom rules
    "quotes": ["error", "double"],
    "import/no-unresolved": 0,
    "indent": ["error", 4, { "SwitchCase": 1 }],
    "max-len": 0,
    "require-jsdoc": 0,
    "object-curly-spacing": ["error", "always"],
    "@typescript-eslint/no-var-requires": 0,
    // Allow unused vars that start with an underscore
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
  },
})
