// Re-exports React hooks with proper TypeScript typing
import * as React from 'react';
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

// Re-export hooks with proper typing for better type inference
export const {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useContext,
  useReducer,
  useLayoutEffect,
  useImperativeHandle,
  useDebugValue,
  forwardRef,
  memo,
  lazy,
  Suspense,
  createContext,
  Component
} = React;

// Re-export types for convenience
export type {
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
};

// Default export for compatibility
export default React;