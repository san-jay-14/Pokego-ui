import type { EvolutionDetail, Pokemon, PokemonSpecies } from '@/types/pokemon'
import { formatName } from '@/utils/pokemon'

/** English genus, e.g. "Seed Pokémon". Falls back gracefully. */
export function getGenus(species: PokemonSpecies): string {
  return species.genera.find((g) => g.language.name === 'en')?.genus ?? 'Pokémon'
}

/** The most recent English Pokédex entry, with control characters cleaned up. */
export function getFlavorText(species: PokemonSpecies): string {
  const entries = species.flavor_text_entries.filter((e) => e.language.name === 'en')
  const entry = entries[entries.length - 1] ?? entries[0]
  return entry ? entry.flavor_text.replace(/[\f\n\r­]/g, ' ').replace(/\s+/g, ' ').trim() : ''
}

/** Gender split from the eighths-female `gender_rate` field. */
export function formatGender(genderRate: number): string {
  if (genderRate < 0) return 'Genderless'
  const female = (genderRate / 8) * 100
  const male = 100 - female
  return `${male}% ♂ · ${female}% ♀`
}

/** Egg cycles → approximate steps to hatch (Gen III+ formula). */
export function formatHatch(hatchCounter: number | null): string {
  if (hatchCounter == null) return '—'
  return `${hatchCounter} cycles · ~${((hatchCounter + 1) * 255).toLocaleString()} steps`
}

/** Capture rate as a rough catch chance at full HP with a standard Poké Ball. */
export function captureChancePct(rate: number): number {
  // Simplified: (rate / 255) at full HP, ×1 ball, no status.
  return Math.round((rate / 255) * 100)
}

export interface LevelUpMove {
  name: string
  level: number
}

/**
 * Level-up learnset: for each move, the lowest level at which it's learned by
 * level-up (across version groups), sorted by level then name.
 */
export function getLevelUpMoves(pokemon: Pokemon): LevelUpMove[] {
  const moves: LevelUpMove[] = []
  for (const slot of pokemon.moves) {
    const levels = slot.version_group_details
      .filter((d) => d.move_learn_method.name === 'level-up' && d.level_learned_at > 0)
      .map((d) => d.level_learned_at)
    if (levels.length > 0) {
      moves.push({ name: slot.move.name, level: Math.min(...levels) })
    }
  }
  return moves.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
}

/** Count of moves learned by TM/HM (machine) — shown as a summary figure. */
export function countMachineMoves(pokemon: Pokemon): number {
  return pokemon.moves.filter((s) =>
    s.version_group_details.some((d) => d.move_learn_method.name === 'machine'),
  ).length
}

/** Human-readable evolution trigger, e.g. "Lv. 16", "Use Fire Stone", "Trade". */
export function formatEvolutionTrigger(details: EvolutionDetail[]): string {
  const d = details[0]
  if (!d) return ''
  if (d.min_level) return `Lv. ${d.min_level}`
  if (d.item) return `Use ${formatName(d.item.name)}`
  if (d.min_happiness != null) return `High friendship${d.time_of_day ? ` (${d.time_of_day})` : ''}`
  if (d.held_item) return `Trade holding ${formatName(d.held_item.name)}`
  if (d.known_move) return `Knowing ${formatName(d.known_move.name)}`
  if (d.location) return `At ${formatName(d.location.name)}`
  if (d.trigger?.name === 'trade') return 'Trade'
  return d.trigger ? formatName(d.trigger.name) : ''
}
