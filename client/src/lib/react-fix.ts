// Re-exports React hooks with proper TypeScript typing
import * as React from 'react';

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

// Default export for compatibility
export default React;