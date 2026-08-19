import type {
  AbilityDetail,
  EvolutionChain,
  MoveDetail,
  Pokemon,
  PokemonIndexEntry,
  PokemonListResponse,
  PokemonSpecies,
  TypeDetail,
  TypeResponse,
} from '@/types/pokemon'

/**
 * Single source of truth for all PokéAPI network access.
 * UI/components never call `fetch` directly — they go through these functions
 * (usually via the React Query hooks in `src/hooks`).
 */

const BASE_URL = 'https://pokeapi.co/api/v2'

/** Discriminated error type so callers can branch on the failure mode. */
export type ApiErrorKind = 'not-found' | 'http' | 'network' | 'malformed'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
  }
}

/**
 * Thin fetch wrapper that normalizes every failure into an `ApiError`.
 * - network drop / DNS / CORS   -> kind: 'network'
 * - 404                          -> kind: 'not-found'
 * - other non-2xx                -> kind: 'http'
 * - invalid JSON                 -> kind: 'malformed'
 */
async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, { signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiError('network', 'Network request failed. Check your connection.')
  }

  if (response.status === 404) {
    throw new ApiError('not-found', 'The requested Pokémon could not be found.', 404)
  }
  if (!response.ok) {
    throw new ApiError('http', `Request failed with status ${response.status}.`, response.status)
  }

  try {
    return (await response.json()) as T
  } catch {
    throw new ApiError('malformed', 'The API returned an unexpected response.')
  }
}

/** Extract the numeric id from a resource url like ".../pokemon/25/". */
export function idFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/)
  return match ? Number(match[1]) : 0
}

/** Normalize a raw user query into an API-safe slug (e.g. "Mr. Mime" -> "mr-mime"). */
export function slugify(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/['.]/g, '')
    .replace(/\s+/g, '-')
}

/**
 * Fetch the full lightweight index of every Pokémon (name + id only).
 * ~1300 entries, ~100KB — fetched once and cached for the session so that
 * search + sort can operate across the whole dex without per-keystroke calls.
 */
export async function fetchAllPokemonIndex(
  signal?: AbortSignal,
): Promise<PokemonIndexEntry[]> {
  const data = await request<PokemonListResponse>('/pokemon?limit=100000&offset=0', signal)
  if (!Array.isArray(data.results)) {
    throw new ApiError('malformed', 'The API returned an unexpected list response.')
  }
  return data.results
    .map((r) => ({ name: r.name, id: idFromUrl(r.url) }))
    .filter((p) => p.id > 0)
    .sort((a, b) => a.id - b.id)
}

/** Fetch full details for a single Pokémon by name or numeric id. */
export async function fetchPokemon(
  nameOrId: string | number,
  signal?: AbortSignal,
): Promise<Pokemon> {
  const key = typeof nameOrId === 'string' ? slugify(nameOrId) : nameOrId
  const data = await request<Pokemon>(`/pokemon/${key}`, signal)
  if (typeof data.id !== 'number' || !Array.isArray(data.types)) {
    throw new ApiError('malformed', 'The API returned an unexpected Pokémon response.')
  }
  return data
}

/** Fetch the set of Pokémon (as index entries) belonging to a given type. */
export async function fetchPokemonByType(
  type: string,
  signal?: AbortSignal,
): Promise<PokemonIndexEntry[]> {
  const data = await request<TypeResponse>(`/type/${slugify(type)}`, signal)
  if (!Array.isArray(data.pokemon)) {
    throw new ApiError('malformed', 'The API returned an unexpected type response.')
  }
  return data.pokemon
    .map((entry) => ({ name: entry.pokemon.name, id: idFromUrl(entry.pokemon.url) }))
    .filter((p) => p.id > 0 && p.id < 100000) // drop odd forms with huge synthetic ids
    .sort((a, b) => a.id - b.id)
}

/** Species-level "flavor" data (Pokédex text, breeding, classification). */
export async function fetchPokemonSpecies(
  nameOrId: string | number,
  signal?: AbortSignal,
): Promise<PokemonSpecies> {
  const key = typeof nameOrId === 'string' ? slugify(nameOrId) : nameOrId
  return request<PokemonSpecies>(`/pokemon-species/${key}`, signal)
}

/** Evolution chain, fetched by its absolute API url (from the species payload). */
export async function fetchEvolutionChain(
  url: string,
  signal?: AbortSignal,
): Promise<EvolutionChain> {
  const path = url.replace(BASE_URL, '')
  return request<EvolutionChain>(path, signal)
}

/** Full type detail, including the damage relations used for type effectiveness. */
export async function fetchTypeDetail(type: string, signal?: AbortSignal): Promise<TypeDetail> {
  return request<TypeDetail>(`/type/${slugify(type)}`, signal)
}

/** A single move's real battle data (power, accuracy, PP, class, effect). */
export async function fetchMove(nameOrId: string | number, signal?: AbortSignal): Promise<MoveDetail> {
  const key = typeof nameOrId === 'string' ? slugify(nameOrId) : nameOrId
  return request<MoveDetail>(`/move/${key}`, signal)
}

/** A single ability's effect text. */
export async function fetchAbility(nameOrId: string | number, signal?: AbortSignal): Promise<AbilityDetail> {
  const key = typeof nameOrId === 'string' ? slugify(nameOrId) : nameOrId
  return request<AbilityDetail>(`/ability/${key}`, signal)
}
