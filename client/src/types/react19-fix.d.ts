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
  export const Component: typeof React.Component;

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
  export type TouchEvent<T = HTMLElement> = React.TouchEvent<T>;
  export type UIEvent<T = HTMLElement> = React.UIEvent<T>;
  export type DragEvent<T = HTMLElement> = React.DragEvent<T>;

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
  export type LazyExoticComponent<T extends React.ComponentType<any>> = React.LazyExoticComponent<T>;

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

  // HTML Attributes
  export type HTMLAttributes<T = HTMLElement> = React.HTMLAttributes<T>;
  export type ButtonHTMLAttributes<T = HTMLButtonElement> = React.ButtonHTMLAttributes<T>;
  export type InputHTMLAttributes<T = HTMLInputElement> = React.InputHTMLAttributes<T>;
  export type TextareaHTMLAttributes<T = HTMLTextAreaElement> = React.TextareaHTMLAttributes<T>;
  export type TdHTMLAttributes<T = HTMLTableDataCellElement> = React.TdHTMLAttributes<T>;
  export type ThHTMLAttributes<T = HTMLTableHeaderCellElement> = React.ThHTMLAttributes<T>;
  export type DetailedHTMLProps<E extends React.HTMLAttributes<T>, T> = React.DetailedHTMLProps<E, T>;
  export type CSSProperties = React.CSSProperties;
  export type RefAttributes<T> = React.RefAttributes<T>;

  // Element types
  export type ElementType<P = any> = React.ElementType<P>;
  export type ElementRef<_T = any> = any;

  // Forward ref types
  export type ForwardRefExoticComponent<P> = React.ForwardRefExoticComponent<P>;
  export type MouseEventHandler<T = HTMLElement> = React.MouseEventHandler<T>;
}
