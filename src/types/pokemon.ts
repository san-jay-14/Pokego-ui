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
  version_group_details: PokemonMoveVersionDetail[]
}

export interface PokemonSprites {
  front_default: string | null
  back_default?: string | null
  front_shiny: string | null
  back_shiny?: string | null
  other?: {
    dream_world?: { front_default: string | null }
    home?: { front_default: string | null; front_shiny?: string | null }
    showdown?: { front_default: string | null }
    ['official-artwork']?: {
      front_default: string | null
      front_shiny?: string | null
    }
  }
}

export interface PokemonCries {
  latest: string | null
  legacy: string | null
}

export interface HeldItem {
  item: NamedAPIResource
}

export interface PokemonMoveVersionDetail {
  level_learned_at: number
  move_learn_method: NamedAPIResource
  version_group: NamedAPIResource
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
  cries?: PokemonCries
  held_items?: HeldItem[]
}

/** GET /pokemon-species/{id} — the "flavor" data (Pokédex text, breeding, etc.) */
export interface FlavorTextEntry {
  flavor_text: string
  language: NamedAPIResource
  version: NamedAPIResource
}

export interface Genus {
  genus: string
  language: NamedAPIResource
}

export interface SpeciesName {
  name: string
  language: NamedAPIResource
}

export interface PokedexNumber {
  entry_number: number
  pokedex: NamedAPIResource
}

export interface PokemonVariety {
  is_default: boolean
  pokemon: NamedAPIResource
}

export interface PokemonSpecies {
  id: number
  name: string
  genera: Genus[]
  flavor_text_entries: FlavorTextEntry[]
  evolution_chain: { url: string }
  evolves_from_species: NamedAPIResource | null
  generation: NamedAPIResource
  habitat: NamedAPIResource | null
  shape: NamedAPIResource | null
  color: NamedAPIResource
  is_legendary: boolean
  is_mythical: boolean
  is_baby: boolean
  capture_rate: number
  base_happiness: number | null
  growth_rate: NamedAPIResource | null
  gender_rate: number // -1 genderless; else eighths female
  egg_groups: NamedAPIResource[]
  hatch_counter: number | null
  names: SpeciesName[]
  pokedex_numbers: PokedexNumber[]
  varieties: PokemonVariety[]
}

/** GET /pokemon/{id}/encounters */
export interface EncounterVersionDetail {
  version: NamedAPIResource
  max_chance: number
  encounter_details: {
    min_level: number
    max_level: number
    chance: number
    method: NamedAPIResource
  }[]
}

export interface LocationAreaEncounter {
  location_area: NamedAPIResource
  version_details: EncounterVersionDetail[]
}

/** GET /evolution-chain/{id} */
export interface EvolutionDetail {
  min_level: number | null
  trigger: NamedAPIResource | null
  item: NamedAPIResource | null
  held_item: NamedAPIResource | null
  min_happiness: number | null
  time_of_day: string
  known_move: NamedAPIResource | null
  location: NamedAPIResource | null
  gender: number | null
}

export interface ChainLink {
  species: NamedAPIResource
  evolution_details: EvolutionDetail[]
  evolves_to: ChainLink[]
}

export interface EvolutionChain {
  id: number
  chain: ChainLink
}

/** GET /type/{name} — defensive damage relations we use for type effectiveness. */
export interface TypeDetail {
  name: string
  damage_relations: {
    double_damage_from: NamedAPIResource[]
    half_damage_from: NamedAPIResource[]
    no_damage_from: NamedAPIResource[]
    double_damage_to: NamedAPIResource[]
    half_damage_to: NamedAPIResource[]
    no_damage_to: NamedAPIResource[]
  }
}

export interface VerboseEffect {
  effect: string
  short_effect: string
  language: NamedAPIResource
}

/** GET /move/{name} */
export interface MoveDetail {
  id: number
  name: string
  type: NamedAPIResource
  power: number | null
  pp: number | null
  accuracy: number | null
  priority: number
  damage_class: NamedAPIResource | null
  effect_entries: VerboseEffect[]
}

/** GET /ability/{name} */
export interface AbilityDetail {
  id: number
  name: string
  effect_entries: VerboseEffect[]
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
