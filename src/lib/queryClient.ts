import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/services/pokemonApi'

/**
 * Shared query client. PokéAPI data is effectively immutable, so we cache
 * aggressively and never refetch on window focus.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30, // 30 min — Pokémon data doesn't change
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Never retry a genuine 404 — the Pokémon simply doesn't exist.
        if (error instanceof ApiError && error.kind === 'not-found') return false
        return failureCount < 2
      },
    },
  },
})
