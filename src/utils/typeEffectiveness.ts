import type { PokemonTypeName, TypeDetail } from '@/types/pokemon'
import { FILTER_TYPES } from '@/constants/pokemonTypes'

export interface Effectiveness {
  type: PokemonTypeName
  multiplier: number
}

export interface TypeEffectiveness {
  weak: Effectiveness[] // ×2 or ×4
  resist: Effectiveness[] // ×0.5 or ×0.25
  immune: PokemonTypeName[] // ×0
}

/** Every attacking type we evaluate the Pokémon's defence against. */
const ALL_TYPES = [...FILTER_TYPES]

/**
 * Combine the defensive damage relations of a Pokémon's (one or two) types into
 * a net effectiveness chart — the real weaknesses/resistances/immunities the
 * PokéAPI encodes, including ×4 / ×¼ stacking on dual types.
 */
export function computeTypeEffectiveness(details: TypeDetail[]): TypeEffectiveness {
  const mult = new Map<string, number>(ALL_TYPES.map((t) => [t, 1]))

  for (const detail of details) {
    const rel = detail.damage_relations
    for (const t of rel.double_damage_from) mult.set(t.name, (mult.get(t.name) ?? 1) * 2)
    for (const t of rel.half_damage_from) mult.set(t.name, (mult.get(t.name) ?? 1) * 0.5)
    for (const t of rel.no_damage_from) mult.set(t.name, (mult.get(t.name) ?? 1) * 0)
  }

  const weak: Effectiveness[] = []
  const resist: Effectiveness[] = []
  const immune: PokemonTypeName[] = []

  for (const type of ALL_TYPES) {
    const m = mult.get(type) ?? 1
    if (m === 0) immune.push(type)
    else if (m > 1) weak.push({ type, multiplier: m })
    else if (m < 1) resist.push({ type, multiplier: m })
  }

  weak.sort((a, b) => b.multiplier - a.multiplier)
  resist.sort((a, b) => a.multiplier - b.multiplier)
  return { weak, resist, immune }
}

/** "×2", "×4", "×½", "×¼" for display. */
export function formatMultiplier(m: number): string {
  if (m === 0.25) return '×¼'
  if (m === 0.5) return '×½'
  return `×${m}`
}
