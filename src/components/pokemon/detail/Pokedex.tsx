import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Crown, Scale, Sparkles, Star, X } from 'lucide-react'
import type {
  AbilityDetail,
  EvolutionChain as EvolutionChainType,
  LocationAreaEncounter,
  Pokemon,
  PokemonSpecies,
} from '@/types/pokemon'
import { formatDexId, formatName } from '@/utils/pokemon'
import { LOCALIZED_LANGUAGES } from '@/utils/species'
import type { TypeEffectiveness } from '@/utils/typeEffectiveness'
import { FavoriteButton } from '@/components/favorites/FavoriteButton'
import { useAppStore } from '@/store/useAppStore'
import { PokedexEntry } from './PokedexEntry'
import { SpriteViewer } from './device/SpriteViewer'
import { TypeButtons } from './device/TypeButtons'
import { EvolutionRail } from './device/EvolutionRail'
import { MoveBrowser } from './device/MoveBrowser'
import { DeviceNav } from './device/DeviceNav'
import { DeviceCry } from './device/DeviceCry'
import { DataConsole } from './device/DataConsole'
import { FormSelector } from './device/FormSelector'

interface PokedexProps {
  base: Pokemon
  active: Pokemon
  species: PokemonSpecies | undefined
  speciesLoading: boolean
  accent: string
  effectiveness: TypeEffectiveness | undefined
  effectivenessLoading: boolean
  abilityDetails: Map<string, AbilityDetail>
  encounters: LocationAreaEncounter[] | undefined
  encountersLoading: boolean
  evolution: EvolutionChainType | undefined
  evolutionLoading: boolean
  formName: string
  onFormSelect: (name: string) => void
  /** When set, the chrome lens acts as the device's close control. */
  onClose?: () => void
}

type Tone = 'legendary' | 'mythical' | 'baby' | 'neutral'

function toneOf(species: PokemonSpecies | undefined): Tone {
  if (species?.is_legendary) return 'legendary'
  if (species?.is_mythical) return 'mythical'
  if (species?.is_baby) return 'baby'
  return 'neutral'
}

const RARITY: Partial<Record<Tone, { icon: ReactNode; label: string }>> = {
  legendary: { icon: <Crown className="h-3.5 w-3.5" />, label: 'Legendary' },
  mythical: { icon: <Star className="h-3.5 w-3.5" />, label: 'Mythical' },
  baby: { icon: <Sparkles className="h-3.5 w-3.5" />, label: 'Baby' },
}

/**
 * The Pokédex — one red book device: identity + sprite on the left leaf,
 * stats/types/evolution/moves on the right leaf.
 */
export function Pokedex(props: PokedexProps) {
  const { base, active, species } = props
  const tone = toneOf(species)
  const rarity = RARITY[tone]
  const holo = tone === 'legendary' || tone === 'mythical'
  const hasForms = (species?.varieties.length ?? 0) > 1

  const [nameIndex, setNameIndex] = useState(0)
  const nameEntries = useMemo(() => {
    const entries = [{ label: 'EN', name: formatName(active.name) }]
    if (species) {
      for (const lang of LOCALIZED_LANGUAGES) {
        const value = species.names.find((n) => n.language.name === lang.code)?.name
        if (value) entries.push({ label: lang.label.slice(0, 2).toUpperCase(), name: value })
      }
    }
    return entries
  }, [active.name, species])
  const safeNameIndex = ((nameIndex % nameEntries.length) + nameEntries.length) % nameEntries.length
  const currentName = nameEntries[safeNameIndex] ?? nameEntries[0]

  return (
    <section className="pokedex-shell mx-auto w-full max-w-[1000px] rounded-[var(--radius-card)] p-3 sm:p-4">
      {/* Moulded seam — curves out from beneath the lens down to the spine hinge */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 hidden h-[125px] w-full lg:block"
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
      >
        <path
          d="M8 7 C10 20 18 24 18 33 C18 41 33 19 47 4"
          fill="none"
          stroke="rgba(0,0,0,0.45)"
          strokeWidth={2.4}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          transform="translate(0.3,0.5)"
        />
        <path
          d="M8 7 C10 20 18 24 18 33 C18 41 33 19 47 4"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={1.3}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          transform="translate(-0.3,-0.4)"
        />
      </svg>

      {/* The two leaves + spine */}
      <div className="pokedex-leaves grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,0.95fr)_auto_minmax(0,0.95fr)] lg:gap-3.5">
        {/* Left leaf — identity (starts at the very top, header included) */}
        <div className="flex flex-col gap-3">
          {/* Status bar */}
          <div className="flex items-center gap-2.5 px-1">
            {/* Chrome-ringed lens — the classic Pokédex "eye", doubling as the
                close control when opened as a modal. */}
            <LensEye onClose={props.onClose} />
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, #fff3b0, #f2c94c 55%, #c99a1f 100%)',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6), 0 0 4px rgba(242,201,76,0.7)',
                }}
              />
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, #baf7c8, #4caf50 55%, #2e7d32 100%)',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6), 0 0 4px rgba(76,175,80,0.7)',
                }}
              />
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, #ffb3b3, #e5484d 55%, #a8262b 100%)',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6), 0 0 4px rgba(229,72,77,0.7)',
                }}
              />
            </div>
            <span className="tabular ml-auto text-xs font-bold uppercase tracking-[0.18em] text-white/60">
              {formatDexId(base.id)}
            </span>
            {rarity && (
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[0.68rem] font-bold uppercase tracking-wide ${
                  tone === 'legendary' ? 'text-[#ffe9a8]' : 'text-white'
                }`}
                style={{ background: 'rgba(0,0,0,0.22)' }}
              >
                {rarity.icon}
                {rarity.label}
              </span>
            )}
            <FavoriteButton id={base.id} name={base.name} size="sm" />
            <CompareButton id={base.id} name={base.name} />
            {active.cries?.latest && <DeviceCry src={active.cries.latest} name={active.name} />}
          </div>

          <div className="lcd mx-auto flex w-[85%] min-w-[210px] items-center gap-1.5 rounded-lg px-2 py-1" style={{ fontFamily: 'var(--font-lcd)' }}>
            {nameEntries.length > 1 && (
              <button
                type="button"
                onClick={() => setNameIndex((i) => i - 1)}
                aria-label="Previous localized name"
                className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2.6} />
              </button>
            )}
            <span className="min-w-0 flex-1 truncate text-2xl leading-none sm:text-3xl">{currentName.name}</span>
            {nameEntries.length > 1 && (
              <button
                type="button"
                onClick={() => setNameIndex((i) => i + 1)}
                aria-label="Next localized name"
                className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2.6} />
              </button>
            )}
            <span className="tabular shrink-0 text-base opacity-70">No. {base.id}</span>
          </div>
          <div className="mx-auto w-[85%] min-w-[210px]">
            <SpriteViewer pokemon={active} dexId={base.id} holo={holo} />
          </div>

          <div className="mx-auto flex w-[85%] min-w-[210px] items-start gap-2">
            <div className="min-w-0 flex-1">
              <PokedexEntry species={species} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <TypeButtons types={active.types} />
              {hasForms && (
                <FormSelector
                  species={species}
                  baseName={base.name}
                  formName={props.formName}
                  onFormSelect={props.onFormSelect}
                />
              )}
            </div>
          </div>
        </div>

        {/* Spine — offset down to start where the left leaf's header ends */}
        <div className="pokedex-hinge hidden lg:flex lg:mt-[56px]" aria-hidden="true">
          <span className="hinge-gap" />
          <span className="hinge-barrel" />
          <span className="hinge-gap" />
          <span className="hinge-barrel" />
          <span className="hinge-gap" />
          <span className="hinge-barrel" />
          <span className="hinge-gap" />
        </div>

        {/* Right leaf — data console. This is the swinging lid: at desktop it
            becomes its own red panel hinged on the spine, so it opens/closes at
            the hinge while the left leaf stays planted. */}
        <div className="pokedex-flap lg:mt-[56px]">
          <div className="mx-auto flex w-[85%] min-w-[210px] flex-col gap-2.5">
            <DataConsole pokemon={active} species={species} abilityDetails={props.abilityDetails} />

            <RailLabel>Evolution</RailLabel>
            <EvolutionRail
              chain={props.evolution}
              isLoading={props.speciesLoading || props.evolutionLoading}
              currentId={base.id}
            />

            {/* Decorative control bar — echoes the classic device's button strip */}
            <div aria-hidden="true" className="mt-1.5 flex items-center justify-center gap-1">
              {Array.from({ length: 7 }, (_, i) => (
                <span key={i} className="console-btn h-3.5 w-7 rounded-md sm:h-4 sm:w-9" />
              ))}
            </div>

            <RailLabel>Moves</RailLabel>
            <MoveBrowser pokemon={active} />

            <DeviceNav id={base.id} />
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * The chrome-ringed blue lens. Purely decorative on its own; when given
 * `onClose` it becomes the device's close button, revealing an ✕ on hover so
 * its new job is discoverable without spoiling the resting look.
 */
function LensEye({ onClose }: { onClose?: () => void }) {
  const inner = (
    <span
      className="relative grid h-full w-full place-items-center overflow-hidden rounded-full"
      style={{
        background:
          'radial-gradient(circle at 34% 26%, #eaf8ff 0%, #8fd0ff 22%, #3f9aeb 52%, #155faa 80%, #0a3866 100%)',
        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.55), inset 0 -3px 6px rgba(5,20,45,0.55)',
      }}
    >
      <span
        className="absolute -left-2 -top-3 h-7 w-9 rounded-full bg-white/70 blur-[3px]"
        style={{ transform: 'rotate(-35deg)' }}
      />
      <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-black/25 blur-[2px]" />
      {onClose && (
        <span className="pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-150 group-hover/lens:opacity-100 group-focus-visible/lens:opacity-100">
          <X className="h-4 w-4 text-white drop-shadow-[0_1px_2px_rgba(0,20,45,0.9)]" strokeWidth={3.2} />
        </span>
      )}
    </span>
  )

  const ringStyle = {
    background: 'linear-gradient(160deg, #f4f6f9 0%, #c7ced9 45%, #8b93a1 100%)',
    boxShadow:
      'inset 0 1px 1px rgba(255,255,255,0.85), inset 0 -1px 2px rgba(0,0,0,0.28), 0 2px 5px rgba(0,0,0,0.45)',
  }

  if (!onClose) {
    return (
      <span
        className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full p-[3px]"
        style={ringStyle}
        aria-hidden="true"
      >
        {inner}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close Pokédex"
      title="Close Pokédex"
      className="group/lens relative grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border-0 p-[3px] outline-none transition-transform duration-150 hover:scale-105 active:scale-90 focus-visible:ring-2 focus-visible:ring-white/85 focus-visible:ring-offset-1"
      style={ringStyle}
    >
      {inner}
    </button>
  )
}

/** Compare toggle for the device status bar — mirrors FavoriteButton so the
 *  detail view is a full entry point for building a head-to-head. */
function CompareButton({ id, name }: { id: number; name: string }) {
  const isComparing = useAppStore((s) => s.compare.includes(id))
  const toggleCompare = useAppStore((s) => s.toggleCompare)
  return (
    <button
      type="button"
      onClick={() => toggleCompare(id)}
      aria-pressed={isComparing}
      aria-label={isComparing ? `Remove ${name} from compare` : `Add ${name} to compare`}
      title={isComparing ? 'Remove from compare' : 'Add to compare'}
      className={`grid h-9 w-9 place-items-center rounded-full border backdrop-blur-sm transition-all duration-200 active:scale-90 ${
        isComparing
          ? 'border-transparent bg-primary/20 text-primary'
          : 'border-border bg-surface/70 text-muted hover:border-primary/40 hover:text-primary'
      }`}
    >
      <Scale className="h-[18px] w-[18px]" strokeWidth={2.2} />
    </button>
  )
}

function RailLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-2 px-0.5 ${className}`}>
      <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/85">{children}</span>
      <span className="h-px flex-1 bg-black/25" />
    </div>
  )
}
