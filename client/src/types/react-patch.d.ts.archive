import 'react';

declare module 'react' {
  interface ReactPortal {
    children?: ReactNode;
  }

  interface SuspenseProps {
    children?: ReactNode;
    fallback?: ReactNode;
  }
  
  export interface FunctionComponent<P = {}> {
    (props: P): ReactElement | null;
    propTypes?: WeakValidationMap<P>;
    contextTypes?: ValidationMap<any>;
    defaultProps?: Partial<P>;
    displayName?: string;
  }

  export interface FC<P = {}> extends FunctionComponent<P> {}

  export type Key = string | number;

  export interface ReactElement<
    P = any,
    T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>
  > {
    $$typeof: symbol | number;
    type: T;
    props: P;
    key: Key | null;
  }

  export interface LazyExoticComponent<T extends ComponentType<any>> {
    (props: ComponentProps<T>): JSX.Element;
    _payload?: { _status: -1 | 0 | 1 | 2; _result: T };
  }
}

declare global {
  namespace JSX {
    interface ElementChildrenAttribute {
      children: {};
    }

    interface IntrinsicElements {
      [elemName: string]: any;
    }

    interface ElementClass extends React.Component<any> {
      render(): React.ReactNode;
    }
  }
}