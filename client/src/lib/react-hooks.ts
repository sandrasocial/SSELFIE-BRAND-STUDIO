import React from 'react';
import type {
  SetStateAction,
  Dispatch,
  EffectCallback,
  MutableRefObject,
  RefObject,
  ComponentType,
  ForwardRefExoticComponent,
  LazyExoticComponent,
  SuspenseProps,
  FunctionComponent
} from '../types/hooks';

// Re-export React hooks with proper types
const {
  useState: useStateImpl,
  useEffect: useEffectImpl,
  useMemo: useMemoImpl,
  useRef: useRefImpl,
  useContext: useContextImpl,
  useReducer: useReducerImpl,
  useCallback: useCallbackImpl,
  useLayoutEffect: useLayoutEffectImpl,
  useImperativeHandle: useImperativeHandleImpl,
  useDebugValue: useDebugValueImpl,
  forwardRef: forwardRefImpl,
  memo: memoImpl,
  lazy: lazyImpl,
  Suspense: SuspenseImpl,
  createContext: createContextImpl
} = React;

// Typed exports
export const useState: typeof React.useState = useStateImpl;
export const useEffect: typeof React.useEffect = useEffectImpl;
export const useMemo: typeof React.useMemo = useMemoImpl;
export const useRef: typeof React.useRef = useRefImpl;
export const useContext: typeof React.useContext = useContextImpl;
export const useReducer: typeof React.useReducer = useReducerImpl;
export const useCallback: typeof React.useCallback = useCallbackImpl;
export const useLayoutEffect: typeof React.useLayoutEffect = useLayoutEffectImpl;
export const useImperativeHandle: typeof React.useImperativeHandle = useImperativeHandleImpl;
export const useDebugValue: typeof React.useDebugValue = useDebugValueImpl;
export const forwardRef: typeof React.forwardRef = forwardRefImpl;
export const memo: typeof React.memo = memoImpl;
export const lazy: typeof React.lazy = lazyImpl;
export const Suspense: typeof React.Suspense = SuspenseImpl;
export const createContext: typeof React.createContext = createContextImpl;