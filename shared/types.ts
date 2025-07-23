interface DataFetcherProps<T> {
  url: string;
  children: (data: T, loading: boolean, error?: Error) => React.ReactNode;
}