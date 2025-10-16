import 'react';

declare module 'react' {
  export interface FunctionComponent<P = {}> {
    (props: P): ReactElement<any, any> | null;
    propTypes?: WeakValidationMap<P>;
    contextTypes?: ValidationMap<any>;
    defaultProps?: Partial<P>;
    displayName?: string;
  }

  export interface FC<P = {}> extends FunctionComponent<P> {}

  export type ReactElement = {
    $$typeof: symbol | number;
    type: string | ComponentType<any>;
    props: any;
    key: string | null;
  };
}

// Patch for event handlers
declare global {
  namespace JSX {
    interface DOMAttributes<T> {
      onClick?: (event: React.MouseEvent<T, MouseEvent>) => void;
      onMouseEnter?: (event: React.MouseEvent<T, MouseEvent>) => void;
      onMouseLeave?: (event: React.MouseEvent<T, MouseEvent>) => void;
    }
  }
}