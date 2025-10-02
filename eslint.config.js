// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [js.configs.recommended, {
  files: ['**/*.{ts,tsx,js,jsx}'],
  languageOptions: {
    parser: tsparser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    globals: {
      // Browser globals
      window: 'readonly',
      document: 'readonly',
      console: 'readonly',
      setTimeout: 'readonly',
      clearTimeout: 'readonly',
      setInterval: 'readonly',
      clearInterval: 'readonly',
      fetch: 'readonly',
      localStorage: 'readonly',
      sessionStorage: 'readonly',
      navigator: 'readonly',
      location: 'readonly',
      history: 'readonly',
      alert: 'readonly',
      confirm: 'readonly',
      performance: 'readonly',
      crypto: 'readonly',
      URL: 'readonly',
      File: 'readonly',
      Event: 'readonly',
      CustomEvent: 'readonly',
      AbortController: 'readonly',
      gtag: 'readonly',
      // DOM Types
      HTMLElement: 'readonly',
      HTMLImageElement: 'readonly',
      HTMLVideoElement: 'readonly',
      HTMLInputElement: 'readonly',
      HTMLDivElement: 'readonly',
      HTMLButtonElement: 'readonly',
      HTMLTextAreaElement: 'readonly',
      HTMLMetaElement: 'readonly',
      // Web APIs
      IntersectionObserver: 'readonly',
      IntersectionObserverEntry: 'readonly',
      ResizeObserver: 'readonly',
      PerformanceObserver: 'readonly',
      PerformanceEntry: 'readonly',
      PerformanceNavigationTiming: 'readonly',
      TouchEvent: 'readonly',
      EventListener: 'readonly',
      // React globals
      React: 'readonly',
      useEffect: 'readonly',
      // Jest globals
      jest: 'readonly',
      describe: 'readonly',
      it: 'readonly',
      expect: 'readonly',
      beforeEach: 'readonly',
      afterEach: 'readonly',
      beforeAll: 'readonly',
      afterAll: 'readonly',
      test: 'readonly',
      // Node.js globals (for server-side code)
      process: 'readonly',
      Buffer: 'readonly',
      global: 'readonly',
      NodeJS: 'readonly',
      // Additional APIs
      apiRequest: 'readonly',
    },
  },
  plugins: {
    '@typescript-eslint': tseslint,
  },
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    
    // General rules
    'no-console': 'warn',
    'no-debugger': 'warn',
    'no-unused-vars': 'off', // Handled by TypeScript
    'prefer-const': 'error',
    'no-var': 'error',
  },
}, {
  ignores: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '*.config.js',
    '.eslintrc.js',
    // Vercel build output
    '.vercel/',
    // Archive and backup directories
    'archive/',
    'tools/debug/',
    // Debug and test files
    '*.spec.ts',
    '*-debug.*',
    '*-diagnostic.spec.*',
    'debug-*',
    // Legacy files
    'legacy/',
  ],
}, ...storybook.configs["flat/recommended"], ...storybook.configs["flat/recommended"], ...storybook.configs["flat/recommended"]];
