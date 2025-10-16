// This augments the existing @types/react
import * as React from 'react';

declare module 'react' {
  export const forwardRef: <T, P = {}>(
    render: (props: P & { ref?: React.Ref<T> }) => React.ReactElement | null
  ) => (props: P & { ref?: React.Ref<T> }) => React.ReactElement | null;

  interface ForwardRefRenderFunction<T, P = {}> {
    (props: P & { ref?: React.Ref<T> }): React.ReactElement | null;
    displayName?: string | undefined;
  }

  interface ElementRef<T extends React.ElementType> {
    current: T extends keyof JSX.IntrinsicElements
      ? JSX.IntrinsicElements[T] extends React.DetailedHTMLProps<React.HTMLAttributes<infer U>, any>
        ? U
        : never
      : T extends React.ComponentClass<any>
      ? InstanceType<T>
      : T extends React.ForwardRefExoticComponent<React.RefAttributes<infer U>>
      ? U
      : never;
  }

  type ComponentPropsWithRef<T extends React.ElementType> = T extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[T]
    : T extends React.ComponentType<infer P>
    ? P
    : never;

  type ComponentPropsWithoutRef<T extends React.ElementType> = Omit<ComponentPropsWithRef<T>, 'ref'>;

  type ElementType<P = any> = {
    [K in keyof JSX.IntrinsicElements]: P extends JSX.IntrinsicElements[K] ? K : never;
  }[keyof JSX.IntrinsicElements] | React.ComponentType<P>;

  interface ForwardRefExoticComponent<P> extends React.NamedExoticComponent<P> {
    defaultProps?: Partial<P>;
    propTypes?: React.WeakValidationMap<P>;
  }

  interface RefAttributes<T> extends React.Attributes {
    ref?: React.Ref<T>;
  }

  interface FunctionComponent<P = {}> {
    (props: React.PropsWithChildren<P>, context?: any): React.ReactElement<any, any> | null;
    propTypes?: React.WeakValidationMap<P>;
    contextTypes?: React.ValidationMap<any>;
    defaultProps?: Partial<P>;
    displayName?: string;
  }

  export type FC<P = {}> = FunctionComponent<P>;

  // Add missing useRef and useState types
  export function useRef<T = undefined>(): MutableRefObject<T | undefined>;
  export function useRef<T>(initialValue: T): MutableRefObject<T>;
  export function useRef<T>(initialValue: T | null): RefObject<T>;

  export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  export function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];

  export type SetStateAction<S> = S | ((prevState: S) => S);
  export type Dispatch<A> = (value: A) => void;
}