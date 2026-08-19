import type { Pokemon, PokemonTypeName } from '@/types/pokemon'
import { formatName, getStat, primaryType } from '@/utils/pokemon'

/**
 * Helpers that translate PokéAPI data into authentic Trading-Card-Game
 * furniture: energy classes, weaknesses, retreat cost and stat-derived attacks.
 * Values are stylised (a card is a game object) but grounded in real data:
 * HP is the real base stat, damage comes from Attack/Sp. Atk, retreat from weight.
 */

/** Real cards deal damage in multiples of ten. */
export function roundTo10(n: number): number {
  return Math.max(10, Math.round(n / 10) * 10)
}

/** Canonical single weakness per type — the ×2 shown at the card foot. */
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

export interface CardAttack {
  name: string
  /** Energy pips: primary type first, remainder colorless. */
  cost: string[]
  damage: number
}

/** Number of energy pips scales with the attack's damage tier. */
function energyCost(damage: number, primary: string): string[] {
  const count = Math.min(3, Math.max(1, Math.floor(damage / 45) + 1))
  return Array.from({ length: count }, (_, i) => (i === 0 ? primary : 'colorless'))
}

/** Up to two attacks built from the Pokémon's real moves + Attack / Sp. Atk stats. */
export function deriveAttacks(pokemon: Pokemon): CardAttack[] {
  const primary = primaryType(pokemon)
  const physical = roundTo10(getStat(pokemon, 'attack'))
  const special = roundTo10(getStat(pokemon, 'special-attack'))
  const attacks: CardAttack[] = []

  if (pokemon.moves[0]) {
    attacks.push({ name: formatName(pokemon.moves[0].move.name), cost: energyCost(physical, primary), damage: physical })
  }
  if (pokemon.moves[1]) {
    attacks.push({ name: formatName(pokemon.moves[1].move.name), cost: energyCost(special, primary), damage: special })
  }
  if (attacks.length === 0) {
    attacks.push({ name: 'Struggle', cost: [primary], damage: physical })
  }
  return attacks
}
