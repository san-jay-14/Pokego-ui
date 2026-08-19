import type { PokemonTypeName } from '@/types/pokemon'

/**
 * Small helpers for the trading-card furniture. Weakness and attack data on the
 * card now come from the real API (type damage relations + move power); these
 * remain for the card-authentic pieces (retreat cost, energy pip counts) and as
 * a fallback weakness while the live type data loads.
 */

/** Canonical single weakness per type — fallback until real /type data resolves. */
const WEAKNESS: Record<PokemonTypeName, PokemonTypeName> = {
  normal: 'fighting',
  fire: 'water',
  water: 'electric',
  grass: 'fire',
  electric: 'ground',
  ice: 'fire',
  fighting: 'psychic',
  poison: 'ground',
  ground: 'water',
  flying: 'electric',
  psychic: 'dark',
  bug: 'fire',
  rock: 'water',
  ghost: 'dark',
  dragon: 'fairy',
  dark: 'fighting',
  steel: 'fire',
  fairy: 'poison',
}

export function weaknessFor(type: string): PokemonTypeName {
  return WEAKNESS[type as PokemonTypeName] ?? 'fighting'
}

/** Heavier Pokémon retreat for more energy — 1 to 4 colorless pips. */
export function retreatCost(weightHectograms: number): number {
  const kg = weightHectograms / 10
  return Math.max(1, Math.min(4, Math.round(kg / 45)))
}

/**
 * Energy pips for an attack, sized to its real power. The move's own type is the
 * first pip, remaining pips colorless — the way real cards mix energy.
 */
export function energyCostForPower(power: number | null, type: string): string[] {
  const count = Math.min(3, Math.max(1, Math.floor((power ?? 0) / 45) + 1))
  return Array.from({ length: count }, (_, i) => (i === 0 ? type : 'colorless'))
}
