/**
 * Type definitions for the PokéAPI responses we consume.
 * Only the fields the app actually uses are modelled — the API returns
 * far more, but narrowing keeps the surface honest and typo-proof.
 */

/** A named reference to another resource, e.g. { name, url }. */
export interface NamedAPIResource {
  name: string
  url: string
}

/** Response shape of GET /pokemon?limit&offset */
export interface PokemonListResponse {
  count: number
  next: string | null
  previous: string | null
  results: NamedAPIResource[]
}

export interface PokemonTypeSlot {
  slot: number
  type: NamedAPIResource
}

export interface PokemonStat {
  base_stat: number
  effort: number
  stat: NamedAPIResource
}

export interface PokemonAbility {
  ability: NamedAPIResource
  is_hidden: boolean
  slot: number
}

export interface PokemonMoveSlot {
  move: NamedAPIResource
}

export interface PokemonSprites {
  front_default: string | null
  front_shiny: string | null
  other?: {
    dream_world?: { front_default: string | null }
    home?: { front_default: string | null }
    ['official-artwork']?: {
      front_default: string | null
      front_shiny?: string | null
    }
  }
}

/** Response shape of GET /pokemon/{name|id} */
export interface Pokemon {
  id: number
  name: string
  height: number // decimetres
  weight: number // hectograms
  base_experience: number | null
  types: PokemonTypeSlot[]
  stats: PokemonStat[]
  abilities: PokemonAbility[]
  moves: PokemonMoveSlot[]
  sprites: PokemonSprites
}

/** Response shape of GET /type/{type} (only the members we need) */
export interface TypeResponse {
  name: string
  pokemon: { slot: number; pokemon: NamedAPIResource }[]
}

/** Canonical Pokémon type names supported by the API. */
export type PokemonTypeName =
  | 'normal'
  | 'fire'
  | 'water'
  | 'grass'
  | 'electric'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy'

/** The six canonical base stats, keyed by their API slug. */
export type StatKey =
  | 'hp'
  | 'attack'
  | 'defense'
  | 'special-attack'
  | 'special-defense'
  | 'speed'

/** A lightweight index entry (name + parsed id) derived from a list result. */
export interface PokemonIndexEntry {
  name: string
  id: number
}
