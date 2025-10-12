/**
 * Stub for next/navigation - Stack Auth tries to import this in Next.js environments
 * In our Vite/React app, these are never called, but we need to provide stubs
 */

export const useRouter = () => ({
  push: () => {},
  replace: () => {},
  prefetch: () => {},
  back: () => {},
  pathname: '/',
  query: {},
  asPath: '/'
});

export const usePathname = () => '/';
export const useSearchParams = () => new URLSearchParams();
export const useParams = () => ({});
export const redirect = () => {};
export const notFound = () => {};

// Next.js 13+ redirect types
export const RedirectType = {
  push: 'push',
  replace: 'replace'
} as const;

export const permanentRedirect = () => {};
