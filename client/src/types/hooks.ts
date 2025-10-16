// Type definitions for React hooks with enhanced typing
import * as React from 'react';

export type SetStateAction<S> = React.SetStateAction<S>;
export type Dispatch<A> = React.Dispatch<A>;
export type EffectCallback = () => (void | (() => void | undefined));
export type MutableRefObject<T> = React.MutableRefObject<T>;
export type RefObject<T> = React.RefObject<T>;
export type ComponentType<P = any> = React.ComponentType<P>;
export type ForwardRefExoticComponent<P> = React.ForwardRefExoticComponent<P>;
export type LazyExoticComponent<T extends ComponentType<any>> = React.LazyExoticComponent<T>;
export type SuspenseProps = React.SuspenseProps;
export type FunctionComponent<P = {}> = React.FunctionComponent<P>;