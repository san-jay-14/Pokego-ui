import type { ReactNode } from 'react'
import type {
  AbilityDetail,
  LocationAreaEncounter,
  Pokemon,
  PokemonSpecies,
} from '@/types/pokemon'
import { STAT_META, formatHeight, formatName, formatWeight } from '@/utils/pokemon'
import {
  LOCALIZED_LANGUAGES,
  captureChancePct,
  formatGender,
  formatHatch,
  formatLocationArea,
  formatPokedexName,
} from '@/utils/species'
import { getTypeConfig } from '@/constants/pokemonTypes'
import { formatMultiplier, type TypeEffectiveness } from '@/utils/typeEffectiveness'
import { EnergyPip } from '@/components/pokemon/EnergyPip'
import { LcdScreen } from './LcdScreen'

/* ---------- shared LCD furniture ---------- */

type ScreenSize = 'normal' | 'compact'

function Screen({
  title,
  children,
  size = 'normal',
}: {
  title: string
  children: ReactNode
  size?: ScreenSize
}) {
  return (
    <LcdScreen className={size === 'compact' ? 'flex flex-col px-3 py-1.5' : 'flex flex-col px-4 py-3'}>
      <h4
        className={`border-b border-[#26340f]/30 font-bold uppercase tracking-[0.18em] ${
          size === 'compact' ? 'mb-0.5 pb-0.5 text-[0.62rem]' : 'mb-2 border-b-2 pb-1 text-sm'
        }`}
        style={{ fontFamily: 'var(--font-lcd)' }}
      >
        {title}
      </h4>
      <div className="flex-1" style={{ fontFamily: 'var(--font-lcd)' }}>
        {children}
      </div>
    </LcdScreen>
  )
}

function Field({ label, value, size = 'normal' }: { label: string; value: ReactNode; size?: ScreenSize }) {
  return (
    <div className={`flex items-baseline gap-1.5 ${size === 'compact' ? 'text-[0.8rem] leading-[1.35]' : 'text-lg leading-snug'}`}>
      <span className="shrink-0 uppercase opacity-80">{label}</span>
      <span className="flex-1 translate-y-[-0.3em] border-b-2 border-dotted border-[#26340f]/30" />
      <span className="tabular text-right">{value}</span>
    </div>
  )
}

function genLabel(gen: string): string {
  return `Gen ${gen.replace('generation-', '').toUpperCase()}`
}

function abilityEffect(detail: AbilityDetail | undefined): string {
  const entry = detail?.effect_entries.find((e) => e.language.name === 'en')
  return entry?.short_effect.replace(/\s+/g, ' ').trim() ?? ''
}

function evYield(pokemon: Pokemon): string {
  const yields = pokemon.stats
    .filter((s) => s.effort > 0)
    .map((s) => `${s.effort} ${STAT_META.find((m) => m.key === s.stat.name)?.short ?? s.stat.name}`)
  return yields.length ? yields.join(', ') : '—'
}

/* ---------- Profile / Training ---------- */

export function ProfileFields({
  pokemon,
  species,
  size = 'normal',
}: {
  pokemon: Pokemon
  species: PokemonSpecies | undefined
  size?: ScreenSize
}) {
  return (
    <div className="flex flex-col">
      <Field label="Height" value={formatHeight(pokemon.height)} size={size} />
      <Field label="Weight" value={formatWeight(pokemon.weight)} size={size} />
      <Field label="Base Exp" value={pokemon.base_experience ?? '—'} size={size} />
      {species && <Field label="Gen" value={genLabel(species.generation.name)} size={size} />}
      {species && <Field label="Habitat" value={species.habitat ? formatName(species.habitat.name) : '—'} size={size} />}
      {species && <Field label="Shape" value={species.shape ? formatName(species.shape.name) : '—'} size={size} />}
      {species && <Field label="Color" value={formatName(species.color.name)} size={size} />}
      {species && <Field label="EV Yield" value={evYield(pokemon)} size={size} />}
      {species && <Field label="Friendship" value={species.base_happiness ?? '—'} size={size} />}
      {species && <Field label="Growth" value={species.growth_rate ? formatName(species.growth_rate.name) : '—'} size={size} />}
      {species && (
        <Field label="Catch" value={`${species.capture_rate} · ${captureChancePct(species.capture_rate)}%`} size={size} />
      )}
    </div>
  )
}

/* ---------- Breeding ---------- */

export function BreedingFields({
  species,
  size = 'normal',
}: {
  species: PokemonSpecies | undefined
  size?: ScreenSize
}) {
  if (!species) return null
  return (
    <div className="flex flex-col">
      <Field label="Gender" value={formatGender(species.gender_rate)} size={size} />
      <Field label="Eggs" value={species.egg_groups.map((g) => formatName(g.name)).join(', ') || '—'} size={size} />
      <Field label="Hatch" value={formatHatch(species.hatch_counter)} size={size} />
    </div>
  )
}

/* ---------- Defenses ---------- */

export function DefensesScreen({
  effectiveness,
  isLoading,
}: {
  effectiveness: TypeEffectiveness | undefined
  isLoading: boolean
}) {
  return (
    <Screen title="Type Matchups">
      {isLoading || !effectiveness ? (
        <p className="text-lg opacity-70">Loading…</p>
      ) : (
        <div className="flex flex-col gap-2">
          <MatchupRow label="Weak" items={effectiveness.weak} />
          <MatchupRow label="Resist" items={effectiveness.resist} />
          {effectiveness.immune.length > 0 && (
            <MatchupRow label="Immune" items={effectiveness.immune.map((type) => ({ type, multiplier: 0 }))} />
          )}
        </div>
      )}
    </Screen>
  )
}

function MatchupRow({ label, items }: { label: string; items: { type: string; multiplier: number }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-16 shrink-0 text-lg uppercase opacity-80">{label}</span>
      {items.length === 0 ? (
        <span className="text-lg opacity-60">None</span>
      ) : (
        items.map((it) => (
          <span
            key={it.type}
            className="inline-flex items-center gap-1 rounded-md bg-[#26340f]/10 px-1.5 py-0.5 text-sm"
            title={getTypeConfig(it.type).label}
          >
            <EnergyPip type={it.type} size={15} />
            {it.multiplier !== 0 && <span className="tabular">{formatMultiplier(it.multiplier)}</span>}
          </span>
        ))
      )}
    </div>
  )
}

/* ---------- Abilities ---------- */

export function AbilitiesFields({
  pokemon,
  details,
  size = 'normal',
}: {
  pokemon: Pokemon
  details: Map<string, AbilityDetail>
  size?: ScreenSize
}) {
  const compact = size === 'compact'
  return (
    <div className={`flex flex-col ${compact ? 'gap-1' : 'gap-2'}`}>
      {pokemon.abilities.map((a) => {
        const effect = abilityEffect(details.get(a.ability.name))
        return (
          <div key={a.ability.name}>
            <div className={`flex items-center gap-2 leading-none ${compact ? 'text-base' : 'text-xl'}`}>
              <span>{formatName(a.ability.name)}</span>
              {a.is_hidden && (
                <span className="rounded bg-[#26340f]/15 px-1 py-0.5 text-[0.62rem] uppercase tracking-wide">
                  Hidden
                </span>
              )}
            </div>
            {effect && (
              <p
                className={`mt-0.5 leading-snug opacity-80 ${compact ? 'line-clamp-2 text-[0.78rem]' : 'text-base'}`}
                title={effect}
              >
                {effect}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ---------- Locations ---------- */

function levelRange(enc: LocationAreaEncounter): string {
  let min = Infinity
  let max = -Infinity
  for (const v of enc.version_details) {
    for (const d of v.encounter_details) {
      min = Math.min(min, d.min_level)
      max = Math.max(max, d.max_level)
    }
  }
  if (min === Infinity) return ''
  return min === max ? `Lv ${min}` : `Lv ${min}–${max}`
}

export function LocationsScreen({
  encounters,
  isLoading,
}: {
  encounters: LocationAreaEncounter[] | undefined
  isLoading: boolean
}) {
  return (
    <Screen title="Where To Find">
      {isLoading ? (
        <p className="text-lg opacity-70">Loading…</p>
      ) : !encounters || encounters.length === 0 ? (
        <p className="text-lg opacity-70">Not found in the wild.</p>
      ) : (
        <div className="no-scrollbar flex max-h-52 flex-col gap-1 overflow-y-auto pr-1">
          {encounters.map((enc) => (
            <div key={enc.location_area.name} className="flex items-baseline gap-1.5 text-base leading-snug">
              <span className="min-w-0 flex-1 truncate">{formatLocationArea(enc.location_area.name)}</span>
              <span className="tabular shrink-0 opacity-80">{levelRange(enc)}</span>
            </div>
          ))}
        </div>
      )}
    </Screen>
  )
}

/* ---------- Names ---------- */

export function NamesScreen({ species }: { species: PokemonSpecies | undefined }) {
  if (!species) return null
  const names = LOCALIZED_LANGUAGES.map((lang) => ({
    label: lang.label,
    value: species.names.find((n) => n.language.name === lang.code)?.name,
  })).filter((n) => n.value)

  const dexNumbers = species.pokedex_numbers.slice(0, 6)

  return (
    <Screen title="Names & Dex">
      <div className="flex flex-col gap-1">
        {names.map((n) => (
          <Field key={n.label} label={n.label} value={n.value} />
        ))}
        {dexNumbers.map((d) => (
          <Field
            key={d.pokedex.name}
            label={formatPokedexName(d.pokedex.name)}
            value={`#${String(d.entry_number).padStart(3, '0')}`}
          />
        ))}
      </div>
    </Screen>
  )
}
