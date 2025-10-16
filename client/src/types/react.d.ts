declare module 'react' {
  export interface ComponentClass<P = {}, S = ComponentState> {
    new (props: P, context: any): Component<P, S>;
    propTypes?: WeakValidationMap<P> | undefined;
    contextTypes?: ValidationMap<any> | undefined;
    childContextTypes?: ValidationMap<any> | undefined;
    defaultProps?: Partial<P> | undefined;
    displayName?: string | undefined;
  }

  export class Component<P = {}, S = {}, SS = any> extends ComponentBase<P, S, SS> {
    constructor(props: Readonly<P>);
    constructor(props: P, context?: any);
    setState<K extends keyof S>(
      state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null),
      callback?: () => void
    ): void;
    forceUpdate(callback?: () => void): void;
    render(): ReactNode;
    readonly props: Readonly<P>;
    state: Readonly<S>;
    context: any;
    refs: {
      [key: string]: Component<any>;
    };
  }

  export class ComponentBase<P = {}, S = {}, SS = any> {
    constructor(props: P, context?: any);
    setState<K extends keyof S>(
      state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null),
      callback?: () => void
    ): void;
    forceUpdate(callback?: () => void): void;
    render(): ReactNode;
    readonly props: Readonly<P> & { children?: ReactNode };
    state: Readonly<S>;
    context: any;
    refs: {
      [key: string]: Component<any>;
    };
  }

  export interface SuspenseProps {
    children?: ReactNode;
    fallback?: ReactNode;
  }

  export const Suspense: ComponentType<SuspenseProps>;

  export interface ErrorInfo {
    componentStack: string;
  }

  export interface ErrorBoundaryProps {
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    children?: ReactNode;
  }

  export class ErrorBoundary extends Component<ErrorBoundaryProps, { hasError: boolean }> {
    static getDerivedStateFromError(error: Error): { hasError: boolean };
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
  }

  export interface FunctionComponent<P = {}> {
    (props: P & { children?: ReactNode | undefined }, context?: any): ReactElement | null;
    propTypes?: WeakValidationMap<P>;
    contextTypes?: ValidationMap<any>;
    defaultProps?: Partial<P>;
    displayName?: string;
  }

  export type FC<P = {}> = FunctionComponent<P>;

  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }

  export interface ReactInstance {}
  export type ReactNode = ReactElement | string | number | boolean | null | undefined | Iterable<ReactNode>;

  export interface WeakValidationMap<T> { }
  export interface ValidationMap<T> { }
  export interface ComponentState { }
  export type Key = string | number;

  export interface JSXElementConstructor<P> {
    (props: P): ReactElement | null;
  }

  export interface PropsWithChildren<P> extends P {
    children?: ReactNode;
  }

  export interface PropsWithRef<T> {
    ref?: ForwardedRef<T>;
  }

  export type ForwardedRef<T> = ((instance: T | null) => void) | MutableRefObject<T | null> | null;

  export interface ComponentType<P = {}> {
    (props: P, context?: any): ReactElement<any, any> | null;
    propTypes?: WeakValidationMap<P>;
    contextTypes?: ValidationMap<any>;
    defaultProps?: Partial<P>;
    displayName?: string;
  }

  export interface ComponentPropsWithRef<T extends ElementType> 
    extends PropsWithRef<ComponentRef<T>>, PropsWithoutRef<PropsWithoutRef<ComponentProps<T>>> {
  }

  export interface MutableRefObject<T> {
    current: T;
  }

  export function forwardRef<T, P = {}>(render: ForwardRefRenderFunction<T, P>): 
    ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;

  export interface ForwardRefExoticComponent<P> extends NamedExoticComponent<P> {
    defaultProps?: Partial<P>;
    propTypes?: WeakValidationMap<P>;
  }

  export interface RefAttributes<T> extends Attributes {
    ref?: Ref<T>;
  }

  export interface Attributes {
    key?: Key | null;
  }

  export type Ref<T> = RefCallback<T> | RefObject<T> | null;
  export type RefCallback<T> = (instance: T | null) => void;
  export interface RefObject<T> {
    readonly current: T | null;
  }

  export interface NamedExoticComponent<P = {}> extends ExoticComponent<P> {
    displayName?: string;
  }

  export interface ExoticComponent<P = {}> {
    (props: P): ReactElement | null;
  }

  export type ElementType<P = any> =
    | { [K in keyof JSX.IntrinsicElements]: P extends JSX.IntrinsicElements[K] ? K : never }[keyof JSX.IntrinsicElements]
    | ComponentType<P>;

  export interface ComponentProps<T extends ElementType> {
    [key: string]: any;
  }

  export type PropsWithoutRef<P> = P extends any ? P & { ref?: never } : P;

  export type ComponentRef<T extends ElementType> = T extends new (...args: any[]) => any
    ? InstanceType<T>
    : T extends (...args: any[]) => any
    ? T extends (...args: any[]) => infer R
      ? R extends { props: any }
        ? R['props'] extends { ref?: infer Ref }
          ? Ref
          : never
        : never
      : never
    : never;

  export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  export function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];

  export type SetStateAction<S> = S | ((prevState: S) => S);
  export type Dispatch<A> = (value: A) => void;

  export function useEffect(effect: EffectCallback, deps?: ReadonlyArray<any>): void;
  export type EffectCallback = () => (void | (() => void | undefined));

  export function useRef<T>(initialValue: T | null): RefObject<T>;
  export function useRef<T>(initialValue: T): MutableRefObject<T>;

  export function useMemo<T>(factory: () => T, deps: ReadonlyArray<any> | undefined): T;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: ReadonlyArray<any>): T;
}