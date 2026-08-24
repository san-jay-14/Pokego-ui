import type {
  ChainLink,
  EvolutionChain,
  EvolutionDetail,
  MoveDetail,
  Pokemon,
  PokemonSpecies,
} from '@/types/pokemon'
import type { ChainSpeciesLink, EnrichmentRow } from '@/services/pokemonApi'

/** The move payload carried on one enrichment row. */
type GqlMove = EnrichmentRow['levelMoves'][number]['pokemon_v2_move']
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

/** Depth of a species within its evolution chain: 0 = Basic, 1 = Stage 1, 2 = Stage 2. */
export function getEvolutionStage(chain: EvolutionChain | undefined, name: string): number | null {
  if (!chain) return null
  const walk = (link: ChainLink, depth: number): number | null => {
    if (link.species.name === name) return depth
    for (const next of link.evolves_to) {
      const found = walk(next, depth + 1)
      if (found !== null) return found
    }
    return null
  }
  return walk(chain.chain, 0)
}

export type ClassificationTone = 'neutral' | 'legendary' | 'mythical' | 'baby'
export interface Classification {
  label: string
  tone: ClassificationTone
}

/**
 * The card's top-left classification: rarity (Legendary/Mythical/Baby) takes
 * precedence, otherwise the evolution stage (Basic / Stage 1 / Stage 2).
 */
export function getClassification(
  species: PokemonSpecies | undefined,
  chain: EvolutionChain | undefined,
  name: string,
): Classification | null {
  if (!species) return null
  if (species.is_legendary) return { label: 'Legendary', tone: 'legendary' }
  if (species.is_mythical) return { label: 'Mythical', tone: 'mythical' }
  if (species.is_baby) return { label: 'Baby', tone: 'baby' }

  const stage = getEvolutionStage(chain, name)
  if (stage === 0) return { label: 'Basic', tone: 'neutral' }
  if (stage === 1) return { label: 'Stage 1', tone: 'neutral' }
  if (stage != null && stage >= 2) return { label: 'Stage 2', tone: 'neutral' }
  // before the chain resolves, fall back to the species' immediate pre-evo
  return { label: species.evolves_from_species ? 'Evolved' : 'Basic', tone: 'neutral' }
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

/* ---------------- Batched card enrichment (GraphQL path) ---------------- */

/** One attack as shown on a trading card. */
export interface CardAttack {
  name: string
  power: number | null
  /** The move's own type slug — drives the first energy pip. */
  type: string
}

/**
 * Everything a `PokemonCard` needs beyond its REST detail payload, resolved in
 * one batched request. Assembled by `useWindowEnrichment`.
 */
export interface CardEnrichment {
  genus: string | null
  classification: Classification | null
  preEvo: { name: string; id: number } | null
  attacks: CardAttack[]
}

/**
 * Evolution depth from a flat species list linked by `evolves_from_species_id`.
 *
 * The REST path walks the nested chain tree (`getEvolutionStage`); GraphQL
 * returns the chain's species as an unordered flat list instead, so depth is a
 * walk *up* the parent pointers — O(depth) rather than a full DFS. The `seen`
 * set guards against a malformed cycle rather than any real data shape.
 */
export function stageFromChainLinks(
  chain: ChainSpeciesLink[],
  speciesId: number,
): number | null {
  const byId = new Map(chain.map((s) => [s.id, s]))
  let current = byId.get(speciesId)
  if (!current) return null

  let stage = 0
  const seen = new Set<number>([current.id])
  while (current.evolves_from_species_id != null) {
    const parent = byId.get(current.evolves_from_species_id)
    if (!parent || seen.has(parent.id)) break
    seen.add(parent.id)
    current = parent
    stage++
  }
  return stage
}

/**
 * Rarity/stage classification from the flat GraphQL shape. Mirrors
 * `getClassification` exactly — rarity wins, otherwise evolution stage.
 */
export function classifyFromChainLinks(
  species: {
    id: number
    is_legendary: boolean
    is_mythical: boolean
    is_baby: boolean
    evolves_from_species_id: number | null
  },
  chain: ChainSpeciesLink[],
): Classification {
  if (species.is_legendary) return { label: 'Legendary', tone: 'legendary' }
  if (species.is_mythical) return { label: 'Mythical', tone: 'mythical' }
  if (species.is_baby) return { label: 'Baby', tone: 'baby' }

  const stage = stageFromChainLinks(chain, species.id)
  if (stage === 0) return { label: 'Basic', tone: 'neutral' }
  if (stage === 1) return { label: 'Stage 1', tone: 'neutral' }
  if (stage != null && stage >= 2) return { label: 'Stage 2', tone: 'neutral' }
  // Chain missing entirely — fall back to the species' own parent link.
  return {
    label: species.evolves_from_species_id != null ? 'Evolved' : 'Basic',
    tone: 'neutral',
  }
}

/**
 * Reduce one raw GraphQL enrichment row to the card's view-model.
 * Attack selection reproduces `getMovesByMethod('level-up')` ordering: earliest
 * level first, ties broken alphabetically, then the first two.
 */
export function toCardEnrichment(row: EnrichmentRow): CardEnrichment {
  const species = row.pokemon_v2_pokemonspecy
  const chain = species?.pokemon_v2_evolutionchain?.pokemon_v2_pokemonspecies ?? []

  const seen = new Set<string>()
  const toAttack = (move: NonNullable<GqlMove>): CardAttack => ({
    name: move.name,
    power: move.power,
    type: move.pokemon_v2_type?.name ?? 'normal',
  })

  // Earliest level-up moves first, ties broken alphabetically.
  const ranked: { level: number; attack: CardAttack }[] = []
  for (const entry of row.levelMoves) {
    const move = entry.pokemon_v2_move
    if (!move || seen.has(move.name)) continue
    seen.add(move.name)
    ranked.push({ level: entry.level ?? 0, attack: toAttack(move) })
  }
  ranked.sort((a, b) => a.level - b.level || a.attack.name.localeCompare(b.attack.name))

  // A Pokémon can list fewer than two level-up moves (Metapod knows only
  // Harden) — top the list up from its other moves, as the REST path did by
  // unioning the level-up names with the full move list.
  const attacks = ranked.slice(0, 2).map((r) => r.attack)
  for (const entry of row.anyMoves) {
    if (attacks.length >= 2) break
    const move = entry.pokemon_v2_move
    if (!move || seen.has(move.name)) continue
    seen.add(move.name)
    attacks.push(toAttack(move))
  }

  const parentId = species?.evolves_from_species_id ?? null
  const parent = parentId != null ? chain.find((s) => s.id === parentId) : undefined

  return {
    genus: species?.pokemon_v2_pokemonspeciesnames[0]?.genus ?? null,
    classification: species ? classifyFromChainLinks(species, chain) : null,
    preEvo: parent ? { name: parent.name, id: parent.id } : null,
    attacks,
  }
}
