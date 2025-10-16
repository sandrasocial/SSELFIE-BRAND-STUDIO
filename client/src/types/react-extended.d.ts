declare module 'react' {
  interface ErrorInfo {
    componentStack: string;
  }

  interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }
  
  type ReactText = string | number;
  type ReactChild = ReactElement | ReactText;
  type ReactFragment = {} | ReactNodeArray;
  interface ReactNodeArray extends Array<ReactNode> {}
  type ReactNode = ReactChild | ReactFragment | boolean | null | undefined;
  
  interface Context<T> {
    Provider: Provider<T>;
    Consumer: Consumer<T>;
    displayName?: string;
    _currentValue: T;
    _currentValue2: T;
    _threadCount: number;
    $$typeof: symbol | number;
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

  type FC<P = {}> = FunctionComponent<P>;

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

  interface Attributes {
    key?: Key | null;
  }

  interface RefAttributes<T> extends Attributes {
    ref?: Ref<T> | undefined;
  }

  type HTMLAttributes<T> = {
    className?: string;
    style?: { [key: string]: string | number };
    id?: string;
    onClick?: (event: MouseEvent) => void;
    onMouseEnter?: (event: MouseEvent) => void;
    onMouseLeave?: (event: MouseEvent) => void;
    role?: string;
    'aria-label'?: string;
    'aria-live'?: 'polite' | 'assertive' | 'off';
    'aria-hidden'?: boolean | 'true' | 'false';
    // Add other common HTML attributes as needed
  } & RefAttributes<T>;

  type ElementRef<T> = T extends RefForwardingComponent<infer R, any>
    ? R
    : T extends new (...args: any[]) => { ref?: infer R }
    ? R
    : T extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[T] extends React.DetailedHTMLProps<infer A, infer E>
      ? E
      : never
    : never;

  type ComponentPropsWithoutRef<T> = T extends ComponentType<infer P>
    ? P extends { ref?: any }
      ? Omit<P, 'ref'>
      : P
    : T extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[T]
    : never;

  interface MouseEvent extends Event {
    target: EventTarget;
    currentTarget: EventTarget;
    preventDefault(): void;
    stopPropagation(): void;
  }

  interface EventTarget {
    tagName: string;
    classList: DOMTokenList;
    getAttribute(name: string): string | null;
  }

  interface DOMTokenList {
    add(...tokens: string[]): void;
    remove(...tokens: string[]): void;
    contains(token: string): boolean;
    toggle(token: string, force?: boolean): boolean;
    replace(oldToken: string, newToken: string): void;
    toString(): string;
  }

  interface ClassAttributes<T> extends Attributes {
    ref?: string | ((instance: T | null) => void) | React.RefObject<T> | null | undefined;
  }

  interface RefObject<T> {
    readonly current: T | null;
  }

  type LegacyRef<T> = string | { bivarianceHack(instance: T | null): void }["bivarianceHack"] | undefined;
  type Ref<T> = RefCallback<T> | RefObject<T> | null;
  type RefCallback<T> = { bivarianceHack(instance: T | null): void }["bivarianceHack"];
}