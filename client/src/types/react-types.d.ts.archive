declare module 'react' {
  type Key = string | number;

  interface ErrorInfo {
    componentStack: string;
  }

  interface RefObject<T> {
    readonly current: T | null;
  }

  type Ref<T> = RefObject<T> | ((instance: T | null) => void) | null;
  
  interface Props {
    children?: ReactNode;
    key?: Key;
    ref?: Ref<any>;
  }

  class Component<P = {}, S = {}, SS = any> {
    static contextType?: Context<any>;
    context: any;
    props: Readonly<P> & Readonly<{ children?: ReactNode | undefined }>;
    state: Readonly<S>;
    refs: { [key: string]: any };
    
    constructor(props: P);
    setState<K extends keyof S>(
      state: ((prevState: Readonly<S>, props: Readonly<P>) => Pick<S, K> | S | null) | (Pick<S, K> | S | null),
      callback?: () => void
    ): void;
    forceUpdate(callback?: () => void): void;
    render(): ReactNode;
    componentDidMount?(): void;
    componentWillUnmount?(): void;
    componentDidCatch?(error: Error, errorInfo: ErrorInfo): void;
    static getDerivedStateFromError?(error: Error): any;
    
    // Lifecycle methods
    shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean;
    componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: SS): void;
    getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): SS | null;
  }

  type ReactText = string | number;
  type ReactChild = ReactElement | ReactText;
  type ReactFragment = {} | ReactNodeArray;
  interface ReactNodeArray extends Array<ReactNode> {}
  type ReactNode = ReactChild | ReactFragment | boolean | null | undefined;
  
  interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }

  interface JSXElementConstructor<P> {
    (props: P): ReactElement<any, any> | null;
  }

  interface Context<T> {
    Provider: Provider<T>;
    Consumer: Consumer<T>;
    displayName?: string;
  }

  interface Provider<T> {
    (props: ProviderProps<T>): ReactElement<any, any> | null;
  }

  interface Consumer<T> {
    (props: ConsumerProps<T>): ReactElement<any, any> | null;
  }

  interface ProviderProps<T> {
    value: T;
    children?: ReactNode;
  }

  interface ConsumerProps<T> {
    children: (value: T) => ReactNode;
  }

  type ElementType<P = any> =
    | {
        [K in keyof JSX.IntrinsicElements]: P extends JSX.IntrinsicElements[K] ? K : never
      }[keyof JSX.IntrinsicElements]
    | ComponentType<P>;

  interface ComponentType<P = {}> {
    (props: P, context?: any): ReactElement<any, any> | null;
    propTypes?: any;
    contextTypes?: any;
    defaultProps?: Partial<P>;
    displayName?: string;
  }

  interface FunctionComponent<P = {}> {
    (props: P, context?: any): ReactElement<any, any> | null;
    propTypes?: any;
    contextTypes?: any;
    defaultProps?: Partial<P>;
    displayName?: string;
  }

  interface ForwardRefExoticComponent<P> extends NamedExoticComponent<P> {
    defaultProps?: Partial<P>;
    propTypes?: any;
  }

  interface NamedExoticComponent<P = {}> {
    (props: P, context?: any): ReactElement | null;
    displayName?: string;
  }

  interface RefForwardingComponent<T, P = {}> {
    (props: P, ref: Ref<T>): ReactElement | null;
    displayName?: string;
    defaultProps?: Partial<P>;
    propTypes?: any;
  }
}

export = React;
export as namespace React;