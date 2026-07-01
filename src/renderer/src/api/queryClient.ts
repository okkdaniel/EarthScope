import { QueryClient } from '@tanstack/react-query'

/**
 * Shared React Query client. Retries are disabled here because the data layer
 * (main process) already retries transient failures with backoff, so retrying
 * again in the renderer would only delay showing the cached fallback.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      gcTime: 30 * 60_000
    }
  }
})
