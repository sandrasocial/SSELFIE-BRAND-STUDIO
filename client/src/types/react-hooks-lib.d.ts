declare module '@lib/react-hooks' {
  export type SetStateAction<S> = S | ((prevState: S) => S);
  export type EffectCallback = () => (void | (() => void | undefined));
  
  export function useState<S>(initialState: S | (() => S)): [S, (state: SetStateAction<S>) => void];
  export function useState<S = undefined>(): [S | undefined, (state: SetStateAction<S | undefined>) => void];
  
  export function useEffect(effect: EffectCallback, deps?: ReadonlyArray<any>): void;
  
  export function useRef<T>(initialValue: T): { current: T };
  export function useRef<T>(initialValue: T | null): { current: T | null };
  export function useRef<T = undefined>(): { current: T | undefined };
  
  export function useMemo<T>(factory: () => T, deps: ReadonlyArray<any> | undefined): T;
  
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: ReadonlyArray<any>): T;
  
  export interface MutableRefObject<T> {
    current: T;
  }

  export interface RefObject<T> {
    readonly current: T | null;
  }
  
  export const Suspense: React.ComponentType<{
    children?: React.ReactNode;
    fallback?: React.ReactNode;
  }>;
  
  export function lazy<T extends React.ComponentType<any>>(
    factory: () => Promise<{ default: T }>
  ): T;

  export const memo: typeof React.memo;
  export const forwardRef: typeof React.forwardRef;
}