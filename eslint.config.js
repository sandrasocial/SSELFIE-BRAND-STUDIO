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
      HTMLAnchorElement: 'readonly',
      HTMLTableDataCellElement: 'readonly',
      HTMLTableHeaderCellElement: 'readonly',
      HTMLCanvasElement: 'readonly',
      HTMLTableSectionElement: 'readonly',
      HTMLSpanElement: 'readonly',
      HTMLTableCellElement: 'readonly',
      HTMLParagraphElement: 'readonly',
      HTMLLIElement: 'readonly',
      HTMLUListElement: 'readonly',
      HTMLTableRowElement: 'readonly',
      HTMLTableElement: 'readonly',
      HTMLTableCaptionElement: 'readonly',
      HTMLLinkElement: 'readonly',
      Blob: 'readonly',
      AbortSignal: 'readonly',
      URLSearchParams: 'readonly',
      RequestInit: 'readonly',
      HTMLHeadingElement: 'readonly',
      HTMLOListElement: 'readonly',
      HTMLScriptElement: 'readonly',
      HTMLFormElement: 'readonly',
      Element: 'readonly',
      Window: 'readonly',
      Performance: 'readonly',
      KeyboardEvent: 'readonly',
      Image: 'readonly',
      ErrorEvent: 'readonly',
      MouseEvent: 'readonly',
      Response: 'readonly',
      Node: 'readonly',
      FormData: 'readonly',
      FileReader: 'readonly',
      CSSStyleDeclaration: 'readonly',
      BodyInit: 'readonly',
      requestAnimationFrame: 'readonly',
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
    'prefer-const': 'warn', // Changed from error to warn
    'no-var': 'error',
    'no-empty': 'warn', // Changed from error to warn
    'no-case-declarations': 'warn', // Changed from error to warn
    'no-useless-catch': 'warn', // Changed from error to warn
  },
}, {
  // Configuration for generated Drizzle schema files (CommonJS)
  files: ['shared/*.js', 'shared/types/*.js'],
  languageOptions: {
    parser: tsparser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
    },
    globals: {
      // Node.js CommonJS globals
      require: 'readonly',
      exports: 'readonly',
      module: 'readonly',
      __dirname: 'readonly',
      __filename: 'readonly',
      process: 'readonly',
      Buffer: 'readonly',
      global: 'readonly',
      NodeJS: 'readonly',
    },
  },
  rules: {
    // Relax rules for generated files
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-console': 'off',
    'no-undef': 'off', // Allow CommonJS globals
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
    // Debug and test files
    '*.spec.ts',
    '*-debug.*',
    '*-diagnostic.spec.*',
    'debug-*',
  ],
}];
