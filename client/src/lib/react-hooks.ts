// Re-export React hooks directly to avoid initialization order issues
// This file acts as a compatibility layer for React hooks
export {
  useState,
  useEffect,
  useMemo,
  useRef,
  useContext,
  useReducer,
  useCallback,
  useLayoutEffect,
  useImperativeHandle,
  useDebugValue,
  forwardRef,
  memo,
  lazy,
  Suspense,
  createContext
} from 'react';