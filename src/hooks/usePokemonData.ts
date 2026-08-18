import { useQueries, useQuery } from '@tanstack/react-query'
import {
  fetchAllPokemonIndex,
  fetchPokemon,
  fetchPokemonByType,
} from '@/services/pokemonApi'
import type { Pokemon, PokemonIndexEntry } from '@/types/pokemon'

/** Query key factory — keeps cache keys consistent across the app. */
export const pokemonKeys = {
  index: ['pokemon', 'index'] as const,
  detail: (nameOrId: string | number) => ['pokemon', 'detail', String(nameOrId)] as const,
  type: (type: string) => ['pokemon', 'type', type] as const,
}

/** The full lightweight dex index (name + id), fetched once per session. */
export function usePokemonIndex() {
  return useQuery({
    queryKey: pokemonKeys.index,
    queryFn: ({ signal }) => fetchAllPokemonIndex(signal),
    staleTime: Infinity,
  })
}

/** Full details for a single Pokémon — used by the detail page. */
export function usePokemonDetail(nameOrId: string | undefined) {
  return useQuery({
    queryKey: pokemonKeys.detail(nameOrId ?? ''),
    queryFn: ({ signal }) => fetchPokemon(nameOrId as string, signal),
    enabled: Boolean(nameOrId),
  })
}

/** Members of a given type; disabled for the "all" pseudo-filter. */
export function useTypeMembers(type: string) {
  return useQuery({
    queryKey: pokemonKeys.type(type),
    queryFn: ({ signal }) => fetchPokemonByType(type, signal),
    enabled: type !== 'all',
    staleTime: Infinity,
  })
}

export interface PokemonDetailsBatch {
  /** Successfully-resolved Pokémon, in the same order as the input entries. */
  pokemon: Pokemon[]
  /** True while at least one entry in the current window is still loading. */
  isLoading: boolean
  /** True only if every entry failed (a genuine batch error worth surfacing). */
  isError: boolean
}

/**
 * Fetch full details for a window of index entries in parallel.
 * Each detail query is cached independently and shared with the detail page,
 * so navigating to a card that's already on screen is instant.
 */
export function usePokemonDetails(entries: PokemonIndexEntry[]): PokemonDetailsBatch {
  const results = useQueries({
    queries: entries.map((entry) => ({
      queryKey: pokemonKeys.detail(entry.name),
      queryFn: ({ signal }: { signal: AbortSignal }) => fetchPokemon(entry.name, signal),
      staleTime: 1000 * 60 * 30,
    })),
  })

  const pokemon = results
    .map((r) => r.data)
    .filter((p): p is Pokemon => Boolean(p))

  const isLoading = results.some((r) => r.isLoading)
  const isError = entries.length > 0 && results.every((r) => r.isError)

  return { pokemon, isLoading, isError }
}
