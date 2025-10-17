/**
 * React 19 TypeScript Compatibility Fix
 * 
 * This file adds missing type aliases from React 19
 * that are used throughout the codebase.
 */

declare module 'react' {
  // Type aliases for commonly used React types
  export type FC<P = {}> = FunctionComponent<P>;
  export type LegacyRef<T> = string | Ref<T>;
}
