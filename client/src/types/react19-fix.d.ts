/**
 * React 19 TypeScript Compatibility Fix
 * 
 * This file fixes TypeScript compatibility issues with React 19
 * by providing proper type definitions for React hooks and components.
 */

declare module 'react' {
  // Export all React hooks that are missing in the current type definitions
  export function useEffect(
    effect: EffectCallback,
    deps?: DependencyList,
  ): void;

  export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  export function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];

  export function useContext<T>(context: Context<T>): T;

  export function useReducer<R extends Reducer<any, any>>(
    reducer: R,
    initialState: ReducerState<R>,
    initializer?: undefined,
  ): [ReducerState<R>, Dispatch<ReducerAction<R>>];

  export function useCallback<T extends Function>(callback: T, deps: DependencyList): T;

  export function useMemo<T>(factory: () => T, deps: DependencyList | undefined): T;

  export function useRef<T>(initialValue: T): MutableRefObject<T>;
  export function useRef<T>(initialValue: T | null): RefObject<T>;
  export function useRef<T = undefined>(): MutableRefObject<T | undefined>;

  export function useImperativeHandle<T, R extends T>(
    ref: Ref<T> | undefined,
    init: () => R,
    deps?: DependencyList,
  ): void;

  export function useLayoutEffect(effect: EffectCallback, deps?: DependencyList): void;

  export function useDebugValue<T>(value: T, format?: (value: T) => any): void;

  // Suspense component
  export const Suspense: React.ComponentType<{
    children?: React.ReactNode;
    fallback?: React.ComponentType<any> | React.ReactElement | null;
  }>;

  // Types for the hooks
  type EffectCallback = () => (void | VoidFunction);
  type DependencyList = ReadonlyArray<any>;
  type SetStateAction<S> = S | ((prevState: S) => S);
  type Dispatch<A> = (value: A) => void;
  type Reducer<S, A> = (prevState: S, action: A) => S;
  type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never;
  type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A> ? A : never;
  type VoidFunction = () => void;

  // Context type
  interface Context<T> {
    Provider: React.ComponentType<{ value: T; children?: React.ReactNode }>;
    Consumer: React.ComponentType<{ children: (value: T) => React.ReactNode }>;
    displayName?: string;
  }

  // Ref types
  interface MutableRefObject<T> {
    current: T;
  }

  interface RefObject<T> {
    readonly current: T | null;
  }

  type Ref<T> = RefCallback<T> | RefObject<T> | null;
  type RefCallback<T> = {
    bivarianceHack(instance: T | null): void;
  }["bivarianceHack"];

  // Component types
  type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>;
  
  interface ComponentClass<P = {}, S = any> {
    new(props: P, context?: any): Component<P, S>;
    propTypes?: WeakValidationMap<P>;
    contextTypes?: ValidationMap<any>;
    childContextTypes?: ValidationMap<any>;
    defaultProps?: Partial<P>;
    displayName?: string;
  }

  interface FunctionComponent<P = {}> {
    (props: P, context?: any): ReactElement<any, any> | null;
    propTypes?: WeakValidationMap<P>;
    contextTypes?: ValidationMap<any>;
    defaultProps?: Partial<P>;
    displayName?: string;
  }

  // Component base class
  class Component<P, S> {
    constructor(props: P, context?: any);
    static contextType?: Context<any>;
    context: unknown;
    state: Readonly<S>;
    props: Readonly<P>;
    refs: {
      [key: string]: ReactInstance;
    };
    setState<K extends keyof S>(
      state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null),
      callback?: () => void
    ): void;
    forceUpdate(callback?: () => void): void;
    render(): ReactNode;
    UNSAFE_componentWillMount?(): void;
    componentDidMount?(): void;
    UNSAFE_componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void;
    static getDerivedStateFromProps?<P, S>(props: P, state: S): Partial<S> | null;
    shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean;
    UNSAFE_componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void;
    getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): any;
    componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: any): void;
    componentWillUnmount?(): void;
    static getDerivedStateFromError?(error: any): Partial<S> | null;
    componentDidCatch?(error: any, errorInfo: ErrorInfo): void;
  }

  // Error info type
  interface ErrorInfo {
    componentStack: string;
  }

  // React element and node types
  interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }

  type ReactNode = ReactElement | string | number | ReactFragment | ReactPortal | boolean | null | undefined;
  type ReactFragment = {} & Iterable<ReactNode>;
  type ReactPortal = ReactElement;
  type Key = string | number;
  type ReactInstance = Component<any> | Element;

  type JSXElementConstructor<P> =
    | ((props: P) => ReactElement<any, any> | null)
    | (new (props: P) => Component<P, any>);

  // Validation types
  type ValidationMap<T> = {
    [K in keyof T]?: Validator<T[K]>;
  };

  type WeakValidationMap<T> = {
    [K in keyof T]?: null extends T[K]
      ? Validator<T[K] | null | undefined>
      : undefined extends T[K]
      ? Validator<T[K] | null | undefined>
      : Validator<T[K]>;
  };

  interface Validator<T> {
    (props: object, propName: string, componentName: string, location: string, propFullName: string): Error | null;
    [nominalTypeHack]?: {
      type: T;
    } | undefined;
  }

  declare const nominalTypeHack: unique symbol;
}
