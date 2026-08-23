import type {
  AbilityDetail,
  EvolutionChain,
  LocationAreaEncounter,
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
/**
 * PokéAPI's GraphQL endpoint. Used where REST's fixed resource shapes are the
 * bottleneck: the whole-dex base-stat index, and the batched card enrichment.
 * Everything else stays on REST, whose GETs are Cloudflare edge-cached.
 */
const GRAPHQL_URL = 'https://beta.pokeapi.co/graphql/v1beta'

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

/** Wild encounter locations for a Pokémon (may be an empty list). */
export async function fetchEncounters(
  nameOrId: string | number,
  signal?: AbortSignal,
): Promise<LocationAreaEncounter[]> {
  const key = typeof nameOrId === 'string' ? slugify(nameOrId) : nameOrId
  const data = await request<LocationAreaEncounter[]>(`/pokemon/${key}/encounters`, signal)
  return Array.isArray(data) ? data : []
}

/**
 * POST a GraphQL document and return `data`, normalizing every failure into an
 * `ApiError` exactly the way `request<T>()` does for REST. `label` is woven into
 * the message so an error surfaces which query failed.
 */
async function graphqlRequest<T>(
  query: string,
  variables: Record<string, unknown> | undefined,
  label: string,
  signal?: AbortSignal,
): Promise<T> {
  let response: Response
  try {
    response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(variables ? { query, variables } : { query }),
      signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiError('network', `Could not reach the ${label}.`)
  }
  if (!response.ok) {
    throw new ApiError('http', `The ${label} request failed (${response.status}).`, response.status)
  }

  let json: { data?: T; errors?: { message?: string }[] }
  try {
    json = await response.json()
  } catch {
    throw new ApiError('malformed', `The ${label} returned an unexpected response.`)
  }
  // GraphQL reports query-level failures as a 200 with an `errors` array.
  if (Array.isArray(json.errors) && json.errors.length > 0) {
    throw new ApiError('malformed', json.errors[0]?.message ?? `The ${label} query failed.`)
  }
  if (json.data == null) {
    throw new ApiError('malformed', `The ${label} returned an unexpected response.`)
  }
  return json.data
}

/** The three base stats the app can sort the whole dex by, keyed by dex id. */
export type SortableStats = { hp: number; attack: number; speed: number }
export type StatIndex = Map<number, SortableStats>

interface GqlStatRow {
  id: number
  pokemon_v2_pokemonstats: { base_stat: number; pokemon_v2_stat: { name: string } }[]
}

/**
 * Fetch the base HP / Attack / Speed of *every* Pokémon in a single GraphQL
 * request (~250KB, cached for the session). This is what lets stat sorting rank
 * the entire dex rather than only the cards already loaded — the REST list
 * endpoint returns no stats, so without this a stat sort could only order the
 * visible window. Callers treat a failure as non-fatal and fall back to sorting
 * the loaded window.
 */
export async function fetchAllPokemonStats(signal?: AbortSignal): Promise<StatIndex> {
  const query = `query StatIndex {
    pokemon_v2_pokemon(limit: 100000) {
      id
      pokemon_v2_pokemonstats(where: { pokemon_v2_stat: { name: { _in: ["hp", "attack", "speed"] } } }) {
        base_stat
        pokemon_v2_stat { name }
      }
    }
  }`

  const data = await graphqlRequest<{ pokemon_v2_pokemon?: GqlStatRow[] }>(
    query,
    undefined,
    'stat index',
    signal,
  )
  const rows = data.pokemon_v2_pokemon
  if (!Array.isArray(rows)) {
    throw new ApiError('malformed', 'The stat index returned an unexpected response.')
  }

  const index: StatIndex = new Map()
  for (const row of rows) {
    const stats: SortableStats = { hp: 0, attack: 0, speed: 0 }
    for (const s of row.pokemon_v2_pokemonstats) {
      const name = s.pokemon_v2_stat.name
      if (name === 'hp' || name === 'attack' || name === 'speed') {
        stats[name] = s.base_stat
      }
    }
    index.set(row.id, stats)
  }
  return index
}

/* ------------------------------------------------------------------------- *
 * Batched card enrichment
 *
 * The grid's trading cards need four things the REST detail payload doesn't
 * carry: the genus, the rarity/evolution-stage classification, the immediate
 * pre-evolution, and two attacks with their real power and type.
 *
 * Fetching those over REST costs five requests per card (species, evolution
 * chain, and two moves) — measured at 49 requests / 1.38 MB for a 20-card
 * window, because REST returns whole resources: `/move/tackle` alone is 55 KB,
 * almost all of it effect text in every language plus the full list of every
 * Pokémon that learns it, to supply three fields.
 *
 * This asks for exactly those fields for the whole window in one request
 * (~45 KB) — ~30x less data, and it collapses the detail -> species ->
 * evolution-chain waterfall into a single round trip.
 * ------------------------------------------------------------------------- */

/** One species in an evolution chain, reduced to its parent link. */
export interface ChainSpeciesLink {
  id: number
  name: string
  evolves_from_species_id: number | null
}

interface GqlMoveRow {
  level: number | null
  pokemon_v2_move: {
    name: string
    power: number | null
    pokemon_v2_type: { name: string } | null
  } | null
}

/** Raw enrichment row as returned by the GraphQL query, one per Pokémon. */
export interface EnrichmentRow {
  id: number
  pokemon_v2_pokemonspecy: {
    id: number
    is_legendary: boolean
    is_mythical: boolean
    is_baby: boolean
    evolves_from_species_id: number | null
    pokemon_v2_pokemonspeciesnames: { genus: string }[]
    pokemon_v2_evolutionchain: { pokemon_v2_pokemonspecies: ChainSpeciesLink[] } | null
  } | null
  /** Distinct level-up moves (one row per move, at its earliest level). */
  levelMoves: GqlMoveRow[]
  /** Fallback for Pokémon/forms that list no level-up moves at all. */
  anyMoves: GqlMoveRow[]
}

// `distinct_on` collapses the version-group duplicates PokéAPI stores per move;
// Hasura requires the distinct column to lead `order_by`, so the earliest level
// is selected by the secondary sort and the top-2 pick happens client-side.
const ENRICHMENT_QUERY = `query WindowEnrichment($ids: [Int!]) {
  pokemon_v2_pokemon(where: { id: { _in: $ids } }) {
    id
    pokemon_v2_pokemonspecy {
      id
      is_legendary
      is_mythical
      is_baby
      evolves_from_species_id
      pokemon_v2_pokemonspeciesnames(where: { language_id: { _eq: 9 } }, limit: 1) { genus }
      pokemon_v2_evolutionchain {
        pokemon_v2_pokemonspecies { id name evolves_from_species_id }
      }
    }
    levelMoves: pokemon_v2_pokemonmoves(
      where: { pokemon_v2_movelearnmethod: { name: { _eq: "level-up" } } }
      order_by: [{ move_id: asc }, { level: asc }]
      distinct_on: move_id
    ) {
      level
      pokemon_v2_move { name power pokemon_v2_type { name } }
    }
    anyMoves: pokemon_v2_pokemonmoves(
      order_by: [{ move_id: asc }]
      distinct_on: move_id
      limit: 2
    ) {
      level
      pokemon_v2_move { name power pokemon_v2_type { name } }
    }
  }
}`

/** Fetch the card-flavor data for a window of Pokémon ids in one request. */
export async function fetchWindowEnrichment(
  ids: number[],
  signal?: AbortSignal,
): Promise<EnrichmentRow[]> {
  if (ids.length === 0) return []
  const data = await graphqlRequest<{ pokemon_v2_pokemon?: EnrichmentRow[] }>(
    ENRICHMENT_QUERY,
    { ids },
    'card details',
    signal,
  )
  const rows = data.pokemon_v2_pokemon
  if (!Array.isArray(rows)) {
    throw new ApiError('malformed', 'The card details returned an unexpected response.')
  }
  return rows
}
