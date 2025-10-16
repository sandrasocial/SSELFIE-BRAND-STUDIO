declare module 'react' {
  // useState
  function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];

  // useEffect
  function useEffect(effect: EffectCallback, deps?: ReadonlyArray<any>): void;

  // useRef
  function useRef<T>(initialValue: T): MutableRefObject<T>;
  function useRef<T>(initialValue: T | null): RefObject<T>;
  function useRef<T = undefined>(): MutableRefObject<T | undefined>;

  // useMemo
  function useMemo<T>(factory: () => T, deps: ReadonlyArray<any> | undefined): T;

  // useCallback
  function useCallback<T extends Function>(callback: T, deps: ReadonlyArray<any>): T;

  // lazy & Suspense
  function lazy<T extends ComponentType<any>>(
    factory: () => Promise<{ default: T }>
  ): LazyExoticComponent<T>;
  
  interface SuspenseProps {
    children?: ReactNode;
    fallback?: ReactNode;
  }
  const Suspense: FunctionComponent<SuspenseProps>;

  // Utility types
  type SetStateAction<S> = S | ((prevState: S) => S);
  type Dispatch<A> = (value: A) => void;
  type EffectCallback = () => (void | (() => void));
  interface MutableRefObject<T> {
    current: T;
  }
  interface ComponentType<P = {}> {
    (props: P): ReactElement<any, any> | null;
    defaultProps?: Partial<P>;
    displayName?: string;
  }
  interface LazyExoticComponent<T extends ComponentType<any>> extends ForwardRefExoticComponent<ComponentPropsWithRef<T>> {
    _payload: { _status: -1 | 0 | 1 | 2; _result: T };
    _init: (payload: { _status: -1 | 0 | 1 | 2; _result: T }) => T;
  }
  
  interface ReactPortal extends ReactElement {
    children: ReactNode;
  }
  
  interface ReactProvider<T> extends ReactElement {
    _context: ReactContext<T>;
  }
  
  interface ReactContext<T> {
    $$typeof: symbol | number;
    Consumer: ReactConsumer<T>;
    Provider: ReactProvider<T>;
    _currentValue: T;
    _currentValue2: T;
    _threadCount: number;
    displayName?: string;
  }
  
  interface ReactConsumer<T> extends ReactElement {
    _context: ReactContext<T>;
  }
  type ComponentProps<T> = T extends ComponentType<infer P> ? P : never;
  type ComponentPropsWithRef<T> = T extends new(props: infer P) => Component<any, any>
    ? P & { ref?: LegacyRef<InstanceType<T>> }
    : T extends (props: infer P) => any
    ? P
    : never;
  type LegacyRef<T> = string | Ref<T>;
}