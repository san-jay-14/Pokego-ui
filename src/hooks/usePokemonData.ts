import { useQueries, useQuery } from '@tanstack/react-query'
import {
  fetchAbility,
  fetchAllPokemonIndex,
  fetchAllPokemonStats,
  fetchEncounters,
  fetchEvolutionChain,
  fetchMove,
  fetchPokemon,
  fetchPokemonByType,
  fetchPokemonSpecies,
  fetchTypeDetail,
} from '@/services/pokemonApi'
import type {
  AbilityDetail,
  MoveDetail,
  Pokemon,
  PokemonIndexEntry,
  TypeDetail,
} from '@/types/pokemon'
import { computeTypeEffectiveness, type TypeEffectiveness } from '@/utils/typeEffectiveness'

/** Query key factory — keeps cache keys consistent across the app. */
export const pokemonKeys = {
  index: ['pokemon', 'index'] as const,
  detail: (nameOrId: string | number) => ['pokemon', 'detail', String(nameOrId)] as const,
  type: (type: string) => ['pokemon', 'type', type] as const,
  species: (nameOrId: string | number) => ['pokemon', 'species', String(nameOrId)] as const,
  evolution: (url: string) => ['pokemon', 'evolution', url] as const,
  typeDetail: (type: string) => ['type', 'detail', type] as const,
  move: (name: string) => ['move', name] as const,
  ability: (name: string) => ['ability', name] as const,
  encounters: (nameOrId: string | number) => ['pokemon', 'encounters', String(nameOrId)] as const,
  statIndex: ['pokemon', 'stat-index'] as const,
}

/** The full lightweight dex index (name + id), fetched once per session. */
export function usePokemonIndex() {
  return useQuery({
    queryKey: pokemonKeys.index,
    queryFn: ({ signal }) => fetchAllPokemonIndex(signal),
    staleTime: Infinity,
  })
}

/**
 * Whole-dex base-stat index (HP / Attack / Speed by id), fetched once via
 * GraphQL so stat sorts can rank every Pokémon — not just the loaded window.
 * A failure is non-fatal: callers fall back to sorting the visible window.
 */
export function usePokemonStatIndex() {
  return useQuery({
    queryKey: pokemonKeys.statIndex,
    queryFn: ({ signal }) => fetchAllPokemonStats(signal),
    staleTime: Infinity,
    retry: 1,
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

/** Species-level flavor data. Enabled once we know the name/id. */
export function usePokemonSpecies(nameOrId: string | number | undefined, enabled = true) {
  return useQuery({
    queryKey: pokemonKeys.species(nameOrId ?? ''),
    queryFn: ({ signal }) => fetchPokemonSpecies(nameOrId as string | number, signal),
    enabled: enabled && nameOrId != null && nameOrId !== '',
    staleTime: Infinity,
  })
}

/** Evolution chain, resolved from the species' chain url. */
export function useEvolutionChain(url: string | undefined, enabled = true) {
  return useQuery({
    queryKey: pokemonKeys.evolution(url ?? ''),
    queryFn: ({ signal }) => fetchEvolutionChain(url as string, signal),
    enabled: enabled && Boolean(url),
    staleTime: Infinity,
  })
}

/** Net type effectiveness for a Pokémon's (one or two) types. */
export function useTypeEffectiveness(types: string[], enabled = true): {
  data: TypeEffectiveness | undefined
  isLoading: boolean
} {
  const results = useQueries({
    queries: types.map((type) => ({
      queryKey: pokemonKeys.typeDetail(type),
      queryFn: ({ signal }: { signal: AbortSignal }) => fetchTypeDetail(type, signal),
      enabled,
      staleTime: Infinity,
    })),
  })

  const details = results
    .map((r) => r.data)
    .filter((d): d is TypeDetail => Boolean(d))

  const isLoading = results.some((r) => r.isLoading)
  const data =
    details.length === types.length && types.length > 0
      ? computeTypeEffectiveness(details)
      : undefined

  return { data, isLoading }
}

/** Batch move details (real power/accuracy/PP/type/class), preserving input order. */
export function useMoveDetails(names: string[], enabled = true) {
  const results = useQueries({
    queries: names.map((name) => ({
      queryKey: pokemonKeys.move(name),
      queryFn: ({ signal }: { signal: AbortSignal }) => fetchMove(name, signal),
      enabled,
      staleTime: Infinity,
    })),
  })
  const byName = new Map<string, MoveDetail>()
  results.forEach((r) => {
    if (r.data) byName.set(r.data.name, r.data)
  })
  return { byName, isLoading: results.some((r) => r.isLoading) }
}

/** Wild encounter locations for a Pokémon. */
export function useEncounters(nameOrId: string | number | undefined) {
  return useQuery({
    queryKey: pokemonKeys.encounters(nameOrId ?? ''),
    queryFn: ({ signal }) => fetchEncounters(nameOrId as string | number, signal),
    enabled: nameOrId != null && nameOrId !== '',
    staleTime: Infinity,
  })
}

/** Batch ability details (effect text). */
export function useAbilityDetails(names: string[]) {
  const results = useQueries({
    queries: names.map((name) => ({
      queryKey: pokemonKeys.ability(name),
      queryFn: ({ signal }: { signal: AbortSignal }) => fetchAbility(name, signal),
      staleTime: Infinity,
    })),
  })
  const byName = new Map<string, AbilityDetail>()
  results.forEach((r) => {
    if (r.data) byName.set(r.data.name, r.data)
  })
  return { byName, isLoading: results.some((r) => r.isLoading) }
}
