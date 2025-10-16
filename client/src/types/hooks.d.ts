import * as React from 'react';

declare global {
  namespace React {
    // React 18.2.0 Hook Types
    function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
    function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];

    function useEffect(effect: EffectCallback, deps?: ReadonlyArray<any>): void;

    function useRef<T>(initialValue: T): MutableRefObject<T>;
    function useRef<T>(initialValue: T | null): RefObject<T>;
    function useRef<T = undefined>(): MutableRefObject<T | undefined>;

    function useMemo<T>(factory: () => T, deps: ReadonlyArray<any> | undefined): T;

    function useCallback<T extends (...args: any[]) => any>(callback: T, deps: ReadonlyArray<any>): T;

    // Extended Component Types
    interface ComponentBase<P = {}, S = {}> {
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
      refs: { [key: string]: Component<any, any> };
    }

    interface Component<P = {}, S = {}> extends ComponentBase<P, S> {}

    interface ErrorBoundaryComponent<P = {}, S = {}> extends Component<P, S> {
      componentDidCatch?(error: Error, errorInfo: ErrorInfo): void;
      static getDerivedStateFromError?(error: Error): Partial<S>;
    }

    // Props and Ref Types
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

    // Suspense Types
    interface SuspenseProps {
      children?: ReactNode;
      fallback?: ReactNode;
    }
    const Suspense: ComponentType<SuspenseProps>;

    // Forward Ref Types
    type ForwardRefRenderFunction<T, P = {}> =
      | ((props: P & RefAttributes<T>, ref: ForwardedRef<T>) => ReactElement | null)
      | { displayName?: string; (props: P & RefAttributes<T>, ref: ForwardedRef<T>): ReactElement | null };

    interface ForwardRefExoticComponent<P> extends NamedExoticComponent<P> {
      defaultProps?: Partial<P>;
      propTypes?: WeakValidationMap<P>;
    }

    const forwardRef: <T, P = {}>(render: ForwardRefRenderFunction<T, P>) => ForwardRefExoticComponent<PropsWithRef<T> & P>;

    // Context Types
    interface Context<T> {
      Provider: Provider<T>;
      Consumer: Consumer<T>;
      displayName?: string;
    }

    function createContext<T>(defaultValue: T): Context<T>;
  }
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export interface CheckoutErrorBoundaryProps extends ErrorBoundaryProps {
  onError: (error: Error) => void;
}