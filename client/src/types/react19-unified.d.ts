/**
 * Unified React 19 Type Definitions
 * 
 * This file consolidates all React type declarations to avoid conflicts
 * and provide proper support for React 19 with TypeScript strict mode.
 * 
 * Consolidates:
 * - react-types.d.ts
 * - react-patch.d.ts
 * - react19.d.ts
 * - components.ts (module declarations)
 * - hooks.d.ts (module declarations)
 */

import type { ReactElement, ReactNode } from 'react';

declare module 'react' {
  // ============================================================================
  // Core Type Definitions
  // ============================================================================

  type Key = string | number;

  interface ErrorInfo {
    componentStack: string;
  }

  interface RefObject<T> {
    readonly current: T | null;
  }

  interface MutableRefObject<T> {
    current: T;
  }

  type Ref<T> = RefObject<T> | ((instance: T | null) => void) | null;

  interface Props {
    children?: ReactNode;
    key?: Key;
    ref?: Ref<any>;
  }

  interface PropsWithRef<T> extends Props {
    ref?: Ref<T>;
  }

  interface RefAttributes<T> extends Props {
    ref?: Ref<T>;
  }

  // ============================================================================
  // React Element Types
  // ============================================================================

  interface ReactElement<
    P = any,
    T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>
  > {
    $$typeof: symbol | number;
    type: T;
    props: P;
    key: Key | null;
  }

  interface ReactPortal {
    $$typeof: symbol | number;
    key: Key | null;
    children?: ReactNode;
  }

  type ReactText = string | number;
  type ReactChild = ReactElement | ReactText;
  type ReactFragment = {} | ReactNodeArray;
  interface ReactNodeArray extends Array<ReactNode> {}
  type ReactNode = ReactChild | ReactFragment | boolean | null | undefined;

  // ============================================================================
  // Component Types
  // ============================================================================

  interface JSXElementConstructor<P> {
    (props: P): ReactElement<any, any> | null | Promise<ReactElement<any, any>> | JSX.Element;
  }

  interface ComponentType<P = {}> {
    (props: P, context?: any): ReactElement<any, any> | null | Promise<ReactElement<any, any>>;
    propTypes?: any;
    contextTypes?: any;
    defaultProps?: Partial<P>;
    displayName?: string;
  }

  interface FunctionComponent<P = {}> {
    (props: P, context?: any): any;
    propTypes?: any;
    contextTypes?: any;
    defaultProps?: Partial<P>;
    displayName?: string;
  }

  // FC is defined in @types/react, we don't need to redefine it
  // interface FC<P = {}> {
  //   (props: any, context?: any): any;
  //   propTypes?: any;
  //   contextTypes?: any;
  //   defaultProps?: Partial<P>;
  //   displayName?: string;
  // }

  type Component<P = {}, S = {}> = {
    (props: P & { children?: ReactNode }, context?: any): ReactElement | Promise<ReactElement> | null;
    displayName?: string;
    defaultProps?: Partial<P>;
  };

  interface ClassComponent<P = {}, S = {}, SS = any> {
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
    shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean;
    componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: SS): void;
    getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): SS | null;
  }

  // ============================================================================
  // Forward Ref Types
  // ============================================================================

  interface ForwardRefRenderFunction<T, P = {}> {
    (props: P, ref: Ref<T>): ReactElement | Promise<ReactElement> | null;
    displayName?: string;
    defaultProps?: Partial<P>;
  }

  interface NamedExoticComponent<P = {}> {
    (props: P, context?: any): ReactElement | null;
    displayName?: string;
  }

  interface ForwardRefExoticComponent<P> extends NamedExoticComponent<P> {
    defaultProps?: Partial<P>;
    propTypes?: any;
    (props: P): JSX.Element | null;
  }

  interface RefForwardingComponent<T, P = {}> {
    (props: P, ref: Ref<T>): ReactElement | null;
    displayName?: string;
    defaultProps?: Partial<P>;
    propTypes?: any;
  }

  // ============================================================================
  // Lazy Loading Types
  // ============================================================================

  interface LazyExoticComponent<T extends ComponentType<any>> {
    (props: ComponentProps<T>): JSX.Element | Promise<JSX.Element>;
    $$typeof: symbol | number;
    _payload?: { _status: -1 | 0 | 1 | 2; _result: T };
    _init?: () => T;
  }

  // ============================================================================
  // Context Types
  // ============================================================================

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

  // ============================================================================
  // Suspense Types
  // ============================================================================

  interface SuspenseProps {
    children?: ReactNode;
    fallback: ReactNode | null;
  }

  // ============================================================================
  // Event Types
  // ============================================================================

  interface SyntheticEvent<T = Element> {
    bubbles: boolean;
    cancelable: boolean;
    currentTarget: EventTarget & T;
    defaultPrevented: boolean;
    eventPhase: number;
    isTrusted: boolean;
    nativeEvent: Event;
    preventDefault(): void;
    isDefaultPrevented(): boolean;
    stopPropagation(): void;
    isPropagationStopped(): boolean;
    persist(): void;
    target: EventTarget;
    timeStamp: number;
    type: string;
  }

  interface KeyboardEvent<T = Element> extends SyntheticEvent<T> {
    altKey: boolean;
    charCode: number;
    ctrlKey: boolean;
    getModifierState(key: string): boolean;
    key: string;
    keyCode: number;
    locale: string;
    location: number;
    metaKey: boolean;
    repeat: boolean;
    shiftKey: boolean;
    which: number;
  }

  interface MouseEvent<T = Element> extends SyntheticEvent<T> {
    altKey: boolean;
    button: number;
    buttons: number;
    clientX: number;
    clientY: number;
    ctrlKey: boolean;
    getModifierState(key: string): boolean;
    metaKey: boolean;
    movementX: number;
    movementY: number;
    pageX: number;
    pageY: number;
    relatedTarget: EventTarget | null;
    screenX: number;
    screenY: number;
    shiftKey: boolean;
  }

  interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
    target: EventTarget & T;
  }

  interface FormEvent<T = Element> extends SyntheticEvent<T> {}

  // ============================================================================
  // Hook Types
  // ============================================================================

  type Dispatch<A> = (value: A) => void;
  type SetStateAction<S> = S | ((prevState: S) => S);
  type EffectCallback = () => void | (() => void | undefined);

  function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];

  function useEffect(effect: EffectCallback, deps?: ReadonlyArray<any>): void;

  function useRef<T>(initialValue: T): MutableRefObject<T>;
  function useRef<T>(initialValue: T | null): RefObject<T>;
  function useRef<T = undefined>(): MutableRefObject<T | undefined>;

  function useMemo<T>(factory: () => T, deps: ReadonlyArray<any> | undefined): T;

  function useCallback<T extends (...args: any[]) => any>(callback: T, deps: ReadonlyArray<any>): T;

  // ============================================================================
  // Utility Types
  // ============================================================================

  type ElementType<P = any> =
    | {
        [K in keyof JSX.IntrinsicElements]: P extends JSX.IntrinsicElements[K] ? K : never
      }[keyof JSX.IntrinsicElements]
    | ComponentType<P>;

  type ComponentProps<T extends ElementType<any>> = T extends ComponentType<infer P>
    ? P
    : T extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[T]
    : {};

  type ComponentPropsWithRef<T extends ElementType<any>> = ComponentProps<T> & RefAttributes<any>;

  type PropsWithChildren<P = {}> = P & { children?: ReactNode };
}

// ============================================================================
// Global JSX Namespace
// ============================================================================

declare global {
  namespace JSX {
    interface Element extends ReactElement<any, any> {
      $$typeof: symbol | number;
    }

    interface ElementChildrenAttribute {
      children: {};
    }

    interface IntrinsicElements {
      [elemName: string]: any;
    }

    interface ElementClass extends React.Component<any> {
      render(): React.ReactNode;
    }

    interface DOMAttributes<T> {
      onClick?: (event: React.MouseEvent<T, MouseEvent>) => void;
      onMouseEnter?: (event: React.MouseEvent<T, MouseEvent>) => void;
      onMouseLeave?: (event: React.MouseEvent<T, MouseEvent>) => void;
    }
  }
}

// Namespace augmentation for React event types
declare namespace React {
  interface SyntheticEvent<T = Element> {
    bubbles: boolean;
    cancelable: boolean;
    currentTarget: EventTarget & T;
    defaultPrevented: boolean;
    eventPhase: number;
    isTrusted: boolean;
    nativeEvent: Event;
    preventDefault(): void;
    isDefaultPrevented(): boolean;
    stopPropagation(): void;
    isPropagationStopped(): boolean;
    persist(): void;
    target: EventTarget;
    timeStamp: number;
    type: string;
  }

  interface KeyboardEvent<T = Element> extends SyntheticEvent<T> {
    altKey: boolean;
    charCode: number;
    ctrlKey: boolean;
    getModifierState(key: string): boolean;
    key: string;
    keyCode: number;
    locale: string;
    location: number;
    metaKey: boolean;
    repeat: boolean;
    shiftKey: boolean;
    which: number;
  }

  interface MouseEvent<T = Element> extends SyntheticEvent<T> {
    altKey: boolean;
    button: number;
    buttons: number;
    clientX: number;
    clientY: number;
    ctrlKey: boolean;
    getModifierState(key: string): boolean;
    metaKey: boolean;
    movementX: number;
    movementY: number;
    pageX: number;
    pageY: number;
    relatedTarget: EventTarget | null;
    screenX: number;
    screenY: number;
    shiftKey: boolean;
  }

  interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
    target: EventTarget & T;
  }

  interface FormEvent<T = Element> extends SyntheticEvent<T> {}

  // ============================================================================
  // Utility Functions
  // ============================================================================

  function memo<P extends object>(
    Component: FunctionComponent<P>,
    propsAreEqual?: (prevProps: P, nextProps: P) => boolean
  ): NamedExoticComponent<P>;

  function memo<T extends ComponentType<any>>(
    Component: T,
    propsAreEqual?: (prevProps: ComponentProps<T>, nextProps: ComponentProps<T>) => boolean
  ): T extends ComponentType<infer P> ? NamedExoticComponent<P> : never;
}

export {};

