declare module 'react' {
  // Re-export original React types
  export * from 'react/index';

  // React Hook Types
  export declare function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  export declare function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];

  export declare function useEffect(effect: EffectCallback, deps?: ReadonlyArray<any>): void;
  
  export declare function useRef<T>(initialValue: T): MutableRefObject<T>;
  export declare function useRef<T>(initialValue: T | null): RefObject<T>;
  export declare function useRef<T = undefined>(): MutableRefObject<T | undefined>;

  export declare function useMemo<T>(factory: () => T, deps: ReadonlyArray<any> | undefined): T;

  export declare function useCallback<T extends (...args: any[]) => any>(callback: T, deps: ReadonlyArray<any>): T;

  // Extended Component Types
  export interface ErrorBoundaryProps {
    children: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    fallback?: ReactNode;
  }

  export interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
  }

  // Component Base Types
  export interface ComponentBase<P = {}, S = {}> extends Component<P, S> {
    context: any;
    setState<K extends keyof S>(
      state: ((prevState: Readonly<S>, props: Readonly<P>) => Pick<S, K> | S | null) | (Pick<S, K> | S | null),
      callback?: () => void
    ): void;
    forceUpdate(callback?: () => void): void;
    render(): ReactNode;
    props: P;
    state: S;
  }

  // Additional Types
  export type PropsWithChildren<P> = P & { children?: ReactNode | undefined };
  export type Key = string | number;
}

declare module '@radix-ui/react-dialog' {
  export interface DialogProps {
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
}

declare module '@vercel/node' {
  export interface VercelRequest extends Request {
    query: { [key: string]: string | string[] };
    cookies: { [key: string]: string };
  }

  export interface VercelResponse extends Response {
    status(code: number): this;
    json(body: any): void;
    send(body: any): void;
  }
}