import type { Pokemon, StatKey } from '@/types/pokemon'

/** Zero-padded dex number, e.g. 25 -> "#025", 6 -> "#006". */
export function formatDexId(id: number): string {
  return `#${String(id).padStart(3, '0')}`
}

/** Title-case a slug, keeping hyphenated forms readable: "mr-mime" -> "Mr Mime". */
export function formatName(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/** API height is in decimetres -> metres. */
export function formatHeight(decimetres: number): string {
  return `${(decimetres / 10).toFixed(1)} m`
}

/** API weight is in hectograms -> kilograms. */
export function formatWeight(hectograms: number): string {
  return `${(hectograms / 10).toFixed(1)} kg`
}

/** API height (decimetres) -> feet & inches, TCG-style, e.g. 5'03". */
export function formatHeightImperial(decimetres: number): string {
  const totalInches = Math.round((decimetres / 10) * 39.3701)
  const feet = Math.floor(totalInches / 12)
  const inches = totalInches % 12
  return `${feet}'${String(inches).padStart(2, '0')}"`
}

/** API weight (hectograms) -> pounds, TCG-style, e.g. 188.5 lbs. */
export function formatWeightImperial(hectograms: number): string {
  return `${((hectograms / 10) * 2.20462).toFixed(1)} lbs.`
}

const ARTWORK_CDN =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'

/**
 * Best available artwork for a Pokémon, most detailed first.
 * Falls back to the deterministic CDN url when sprite fields are missing.
 */
export function getArtwork(pokemon: Pokemon): string {
  return (
    pokemon.sprites.other?.['official-artwork']?.front_default ??
    pokemon.sprites.other?.home?.front_default ??
    pokemon.sprites.front_default ??
    `${ARTWORK_CDN}/${pokemon.id}.png`
  )
}

/** Deterministic artwork url from an id alone (used before details load). */
export function artworkFromId(id: number): string {
  return `${ARTWORK_CDN}/${id}.png`
}

/** The primary type slug drives a card / hero's aura colour. */
export function primaryType(pokemon: Pokemon): string {
  return pokemon.types[0]?.type.name ?? 'normal'
}

export interface StatMeta {
  key: StatKey
  label: string
  short: string
}

/** Display metadata + ordering for the six base stats. */
export const STAT_META: StatMeta[] = [
  { key: 'hp', label: 'HP', short: 'HP' },
  { key: 'attack', label: 'Attack', short: 'ATK' },
  { key: 'defense', label: 'Defense', short: 'DEF' },
  { key: 'special-attack', label: 'Sp. Atk', short: 'SPA' },
  { key: 'special-defense', label: 'Sp. Def', short: 'SPD' },
  { key: 'speed', label: 'Speed', short: 'SPE' },
]

/** Highest base stat the bar scale is normalized against (Blissey HP = 255). */
export const MAX_STAT = 255

/** Convenience: pull a single base stat value from a Pokémon. */
export function getStat(pokemon: Pokemon, key: StatKey): number {
  return pokemon.stats.find((s) => s.stat.name === key)?.base_stat ?? 0
}

/** Sum of all base stats — shown on the detail page. */
export function totalStats(pokemon: Pokemon): number {
  return pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0)
}
