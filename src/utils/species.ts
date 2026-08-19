import type { EvolutionDetail, MoveDetail, Pokemon, PokemonSpecies } from '@/types/pokemon'
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

export type LearnMethod = 'level-up' | 'machine' | 'egg' | 'tutor'

export interface LearnMove {
  name: string
  /** Level for level-up moves; null for TM/egg/tutor. */
  level: number | null
}

/** Moves a Pokémon learns by a given method, de-duped and sorted sensibly. */
export function getMovesByMethod(pokemon: Pokemon, method: LearnMethod): LearnMove[] {
  const moves: LearnMove[] = []
  for (const slot of pokemon.moves) {
    const details = slot.version_group_details.filter((d) => d.move_learn_method.name === method)
    if (details.length === 0) continue
    if (method === 'level-up') {
      const levels = details.map((d) => d.level_learned_at).filter((l) => l > 0)
      moves.push({ name: slot.move.name, level: levels.length ? Math.min(...levels) : 0 })
    } else {
      moves.push({ name: slot.move.name, level: null })
    }
  }
  if (method === 'level-up') {
    moves.sort((a, b) => (a.level ?? 0) - (b.level ?? 0) || a.name.localeCompare(b.name))
  } else {
    moves.sort((a, b) => a.name.localeCompare(b.name))
  }
  return moves
}

/** English short-effect text for a move, cleaned of whitespace. */
export function moveShortEffect(detail: MoveDetail | undefined): string {
  const entry = detail?.effect_entries.find((e) => e.language.name === 'en')
  return entry?.short_effect.replace(/\s+/g, ' ').trim() ?? ''
}

/** Form label relative to the base species, e.g. "charizard-mega-x" → "Mega X". */
export function formatFormLabel(name: string, baseName: string): string {
  if (name === baseName) return 'Default'
  const suffix = name.startsWith(`${baseName}-`) ? name.slice(baseName.length + 1) : name
  const map: Record<string, string> = { gmax: 'Gigantamax', 'mega-x': 'Mega X', 'mega-y': 'Mega Y', mega: 'Mega' }
  return map[suffix] ?? formatName(suffix)
}

/** Language codes we surface for localized names, with display labels. */
export const LOCALIZED_LANGUAGES: { code: string; label: string }[] = [
  { code: 'ja-hrkt', label: 'Japanese' },
  { code: 'ja-roma', label: 'Rōmaji' },
  { code: 'ko', label: 'Korean' },
  { code: 'zh-hant', label: 'Chinese' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'es', label: 'Spanish' },
  { code: 'it', label: 'Italian' },
]

/** "kanto-route-3-area" → "Kanto Route 3". */
export function formatLocationArea(name: string): string {
  return formatName(name.replace(/-area$/, ''))
}

/** "original-johto" → "Johto"; "national" → "National". */
export function formatPokedexName(name: string): string {
  return formatName(name.replace(/^original-|-old$|updated-/g, ''))
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
