import type { PokemonTypeName } from '@/types/pokemon'

/**
 * Centralized Pokémon type configuration.
 *
 * Every type-derived colour in the app resolves through here — cards, badges,
 * detail auras and stat bars. Nothing should hard-code a type colour elsewhere.
 *
 * - `color`   : the saturated primary, used for text/badges on tinted surfaces
 * - `onColor` : legible text/icon colour when placed ON `color`
 * - `from/to` : gradient stops for the card + hero "type aura"
 * - `glow`    : rgba used for ambient radial glows
 * - `emoji`   : small playful glyph shown in badges
 */
export interface TypeConfig {
  label: string
  color: string
  onColor: string
  from: string
  to: string
  glow: string
  emoji: string
}

export const TYPE_CONFIG: Record<PokemonTypeName, TypeConfig> = {
  normal: { label: 'Normal', color: '#8f9199', onColor: '#ffffff', from: '#a8a9b4', to: '#6d6f79', glow: 'rgba(143,145,153,0.45)', emoji: '⬤' },
  fire: { label: 'Fire', color: '#f0803c', onColor: '#ffffff', from: '#ff9a52', to: '#e35d2b', glow: 'rgba(240,128,60,0.5)', emoji: '🔥' },
  water: { label: 'Water', color: '#4d90d6', onColor: '#ffffff', from: '#5fb0f5', to: '#2f6fc4', glow: 'rgba(77,144,214,0.5)', emoji: '💧' },
  grass: { label: 'Grass', color: '#4aa96c', onColor: '#ffffff', from: '#68c98a', to: '#379055', glow: 'rgba(74,169,108,0.5)', emoji: '🍃' },
  electric: { label: 'Electric', color: '#e0b032', onColor: '#3a2f00', from: '#ffd84d', to: '#e0a416', glow: 'rgba(224,176,50,0.55)', emoji: '⚡' },
  ice: { label: 'Ice', color: '#5fbcbd', onColor: '#053033', from: '#88dcdd', to: '#3fa3a4', glow: 'rgba(95,188,189,0.5)', emoji: '❄️' },
  fighting: { label: 'Fighting', color: '#cf3f61', onColor: '#ffffff', from: '#e2607e', to: '#b02742', glow: 'rgba(207,63,97,0.5)', emoji: '🥊' },
  poison: { label: 'Poison', color: '#a462cf', onColor: '#ffffff', from: '#c07fe6', to: '#8340ad', glow: 'rgba(164,98,207,0.5)', emoji: '☠️' },
  ground: { label: 'Ground', color: '#d1955a', onColor: '#39230a', from: '#e6b077', to: '#b7793c', glow: 'rgba(209,149,90,0.5)', emoji: '⛰️' },
  flying: { label: 'Flying', color: '#8fa8de', onColor: '#0e1a3a', from: '#a9beea', to: '#6f8bc9', glow: 'rgba(143,168,222,0.5)', emoji: '🪶' },
  psychic: { label: 'Psychic', color: '#ec5f8f', onColor: '#ffffff', from: '#ff82ab', to: '#d43e72', glow: 'rgba(236,95,143,0.5)', emoji: '🔮' },
  bug: { label: 'Bug', color: '#94b63a', onColor: '#1c2400', from: '#aecb52', to: '#7b9c26', glow: 'rgba(148,182,58,0.5)', emoji: '🐛' },
  rock: { label: 'Rock', color: '#b6a565', onColor: '#241d02', from: '#cbbc82', to: '#978648', glow: 'rgba(182,165,101,0.5)', emoji: '🪨' },
  ghost: { label: 'Ghost', color: '#6a5aa8', onColor: '#ffffff', from: '#8878c4', to: '#4d3f86', glow: 'rgba(106,90,168,0.5)', emoji: '👻' },
  dragon: { label: 'Dragon', color: '#6a5bd6', onColor: '#ffffff', from: '#8577f0', to: '#4a3bb0', glow: 'rgba(106,91,214,0.5)', emoji: '🐉' },
  dark: { label: 'Dark', color: '#5b5468', onColor: '#ffffff', from: '#736b82', to: '#3f3a49', glow: 'rgba(91,84,104,0.5)', emoji: '🌙' },
  steel: { label: 'Steel', color: '#5a8a9c', onColor: '#ffffff', from: '#7cadbf', to: '#3d6675', glow: 'rgba(90,138,156,0.5)', emoji: '⚙️' },
  fairy: { label: 'Fairy', color: '#e277ba', onColor: '#3a0a2a', from: '#f79ad3', to: '#cc5599', glow: 'rgba(226,119,186,0.5)', emoji: '✨' },
}

/** Fallback used for unknown / unexpected type slugs from the API. */
export const FALLBACK_TYPE: TypeConfig = {
  label: 'Unknown',
  color: '#8f9199',
  onColor: '#ffffff',
  from: '#a8a9b4',
  to: '#6d6f79',
  glow: 'rgba(143,145,153,0.45)',
  emoji: '❔',
}

export function getTypeConfig(type: string): TypeConfig {
  return TYPE_CONFIG[type as PokemonTypeName] ?? FALLBACK_TYPE
}

/** Order used by the type filter — grouped by colour family for scanability. */
export const FILTER_TYPES: PokemonTypeName[] = [
  'fire',
  'water',
  'grass',
  'electric',
  'psychic',
  'ice',
  'dragon',
  'dark',
  'fairy',
  'fighting',
  'poison',
  'ground',
  'flying',
  'bug',
  'rock',
  'ghost',
  'steel',
  'normal',
]
