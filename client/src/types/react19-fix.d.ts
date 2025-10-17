/**
 * React 19 TypeScript Compatibility Fix
 *
 * This file re-exports React types that are used throughout the codebase
 * but are not exported as named exports in React 19.
 */

declare module 'react' {
  // Re-export types from React namespace
  export type ReactElement = React.ReactElement;
  export type ReactPortal = React.ReactPortal;

  // Component types
  export type FunctionComponent<P = {}> = React.FunctionComponent<P>;
  export type FC<P = {}> = React.FC<P>;
  export type ComponentType<P = {}> = React.ComponentType<P>;
  export type Component<P = {}, S = {}> = React.Component<P, S>;

  // Hook types - re-export from React namespace
  export const useState: typeof React.useState;
  export const useEffect: typeof React.useEffect;
  export const useRef: typeof React.useRef;
  export const useContext: typeof React.useContext;
  export const useReducer: typeof React.useReducer;
  export const useCallback: typeof React.useCallback;
  export const useMemo: typeof React.useMemo;
  export const useLayoutEffect: typeof React.useLayoutEffect;
  export const useImperativeHandle: typeof React.useImperativeHandle;
  export const useDebugValue: typeof React.useDebugValue;
  export const useId: typeof React.useId;
  export const useTransition: typeof React.useTransition;
  export const useDeferredValue: typeof React.useDeferredValue;
  export const useSyncExternalStore: typeof React.useSyncExternalStore;
  export const useInsertionEffect: typeof React.useInsertionEffect;

  // Event types
  export type ChangeEvent<T = HTMLInputElement> = React.ChangeEvent<T>;
  export type KeyboardEvent<T = HTMLElement> = React.KeyboardEvent<T>;
  export type MouseEvent<T = HTMLElement> = React.MouseEvent<T>;
  export type FocusEvent<T = HTMLElement> = React.FocusEvent<T>;
  export type FormEvent<T = HTMLFormElement> = React.FormEvent<T>;

  // Ref types
  export type Ref<T> = React.Ref<T>;
  export type RefObject<T> = React.RefObject<T>;
  export type MutableRefObject<T> = React.MutableRefObject<T>;
  export type LegacyRef<T> = React.LegacyRef<T>;
  export type ForwardedRef<T> = React.ForwardedRef<T>;

  // Utility types
  export type PropsWithChildren<P = {}> = React.PropsWithChildren<P>;
  export type PropsWithRef<P> = React.PropsWithRef<P>;
  export type PropsWithoutRef<P> = React.PropsWithoutRef<P>;
  export type ReactNode = React.ReactNode;

  // Higher-order component types
  export const memo: typeof React.memo;
  export const forwardRef: typeof React.forwardRef;
  export const lazy: typeof React.lazy;

  // Context
  export const createContext: typeof React.createContext;

  // Fragment
  export const Fragment: typeof React.Fragment;
  export const Suspense: typeof React.Suspense;

  // Dependency list
  export type DependencyList = React.DependencyList;

  // Error boundary types
  export type ErrorInfo = React.ErrorInfo;
  export type JSXElementConstructor<P> = React.JSXElementConstructor<P>;

  // Component props
  export type ComponentProps<T extends React.ElementType<any>> = React.ComponentProps<T>;
  export type ComponentPropsWithoutRef<T extends React.ElementType<any>> = React.ComponentPropsWithoutRef<T>;
  export type ComponentPropsWithRef<T extends React.ElementType<any>> = React.ComponentPropsWithRef<T>;
}
