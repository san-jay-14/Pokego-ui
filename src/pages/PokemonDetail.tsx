import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Crown, Sparkles, Star, Zap } from 'lucide-react'
import type { Pokemon } from '@/types/pokemon'
import {
  useAbilityDetails,
  useEncounters,
  useEvolutionChain,
  usePokemonDetail,
  usePokemonSpecies,
  useTypeEffectiveness,
} from '@/hooks/usePokemonData'
import { getTypeConfig } from '@/constants/pokemonTypes'
import { formatDexId, formatName, getArtwork, primaryType } from '@/utils/pokemon'
import { getGenus } from '@/utils/species'
import { PageContainer } from '@/components/layout/PageContainer'
import { StatBars } from '@/components/pokemon/StatBars'
import { FavoriteButton } from '@/components/favorites/FavoriteButton'
import { DetailSkeleton } from '@/components/states/DetailSkeleton'
import { ErrorState } from '@/components/states/ErrorState'
import { Button } from '@/components/ui/Button'
import { ApiError } from '@/services/pokemonApi'
import { SectionCard } from '@/components/pokemon/detail/Section'
import { PokedexEntry } from '@/components/pokemon/detail/PokedexEntry'
import { ProfilePanel } from '@/components/pokemon/detail/ProfilePanel'
import { TypeDefenses } from '@/components/pokemon/detail/TypeDefenses'
import { AbilitiesPanel } from '@/components/pokemon/detail/AbilitiesPanel'
import { EvolutionChain } from '@/components/pokemon/detail/EvolutionChain'
import { MovesPanel } from '@/components/pokemon/detail/MovesPanel'
import { SpriteGallery } from '@/components/pokemon/detail/SpriteGallery'
import { CryButton } from '@/components/pokemon/detail/CryButton'
import { FormsSwitcher } from '@/components/pokemon/detail/FormsSwitcher'
import { NamesPanel } from '@/components/pokemon/detail/NamesPanel'
import { EncountersPanel } from '@/components/pokemon/detail/EncountersPanel'

export function PokemonDetail() {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError, error, refetch } = usePokemonDetail(name)

  return (
    <PageContainer className="py-5 sm:py-8">
      <div className="mb-5">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="pl-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {isLoading && <DetailSkeleton />}

      {isError && !isLoading && (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface">
          <ErrorState
            error={error}
            onRetry={error instanceof ApiError && error.kind === 'not-found' ? undefined : () => refetch()}
          />
          {error instanceof ApiError && error.kind === 'not-found' && (
            <div className="flex justify-center pb-12">
              <Button variant="primary" onClick={() => navigate('/')}>
                Back to Pokédex
              </Button>
            </div>
          )}
        </div>
      )}

      {data && !isLoading && <DetailContent key={data.id} base={data} />}
    </PageContainer>
  )
}

function DetailContent({ base }: { base: Pokemon }) {
  const [formName, setFormName] = useState(base.name)

  const species = usePokemonSpecies(base.id)
  const formQuery = usePokemonDetail(formName)
  const active = formQuery.data ?? base // the currently-selected form

  const cfg = getTypeConfig(primaryType(active))
  const evolution = useEvolutionChain(species.data?.evolution_chain.url)

  const typeNames = useMemo(() => active.types.map((t) => t.type.name), [active])
  const effectiveness = useTypeEffectiveness(typeNames)

  const abilityNames = useMemo(() => active.abilities.map((a) => a.ability.name), [active])
  const abilities = useAbilityDetails(abilityNames)

  const encounters = useEncounters(active.id)
  const genus = species.data ? getGenus(species.data) : undefined

  return (
    <article className="animate-float-in flex flex-col gap-5">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-[var(--radius-card)] px-6 py-7 text-white shadow-[var(--shadow-lg)] sm:px-10 sm:py-9"
        style={{ background: `linear-gradient(135deg, ${cfg.from}, ${cfg.to})` }}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/15 via-black/25 to-black/45" />
        <svg aria-hidden="true" viewBox="0 0 100 100" className="pointer-events-none absolute -right-10 -top-12 h-64 w-64 opacity-15">
          <circle cx="50" cy="50" r="46" fill="none" stroke="white" strokeWidth="4" />
          <path d="M4 50h30a16 16 0 0 1 32 0h30" fill="none" stroke="white" strokeWidth="4" />
          <circle cx="50" cy="50" r="11" fill="white" />
        </svg>
        <span aria-hidden="true" className="tabular pointer-events-none absolute -bottom-6 right-4 select-none text-[9rem] font-bold leading-none text-white/10">
          {String(base.id).padStart(3, '0')}
        </span>

        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-10">
          <div className="relative shrink-0">
            <div className="absolute inset-0 -z-10 rounded-full blur-2xl" style={{ background: 'rgba(255,255,255,0.35)' }} />
            <img
              src={getArtwork(active)}
              alt={formatName(active.name)}
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = '/pokeball.svg'
                e.currentTarget.classList.add('opacity-40')
              }}
              className="h-44 w-44 object-contain drop-shadow-[0_16px_24px_rgba(0,0,0,0.3)] sm:h-56 sm:w-56"
              draggable={false}
            />
          </div>

          <div className="flex flex-1 flex-col items-center text-center sm:items-start sm:text-left" style={{ textShadow: '0 2px 14px rgba(0,0,0,0.35)' }}>
            <span className="tabular text-sm font-bold uppercase tracking-[0.2em] text-white/80">
              {formatDexId(base.id)}
            </span>
            <h1 className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">{formatName(active.name)}</h1>
            {genus && <p className="mt-1 text-sm font-semibold text-white/85">{genus}</p>}

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {active.types.map((t) => (
                <span key={t.type.name} className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-sm font-semibold backdrop-blur-sm">
                  <span aria-hidden="true">{getTypeConfig(t.type.name).emoji}</span>
                  {getTypeConfig(t.type.name).label}
                </span>
              ))}
              {species.data?.is_legendary && <RarityBadge icon={<Crown className="h-3.5 w-3.5" />} label="Legendary" />}
              {species.data?.is_mythical && <RarityBadge icon={<Star className="h-3.5 w-3.5" />} label="Mythical" />}
              {species.data?.is_baby && <RarityBadge icon={<Sparkles className="h-3.5 w-3.5" />} label="Baby" />}
            </div>

            <div className="mt-5 flex items-center gap-2">
              <FavoriteButton id={base.id} name={base.name} size="md" />
              {active.cries?.latest && <CryButton src={active.cries.latest} name={active.name} />}
              <DexNav id={base.id} />
            </div>
          </div>
        </div>
      </section>

      {/* Forms */}
      {species.data && (
        <FormsSwitcher varieties={species.data.varieties} baseName={base.name} active={formName} onSelect={setFormName} />
      )}

      {/* Pokédex entry */}
      <PokedexEntry species={species.data} />

      {/* Stats · Defenses · Profile · Abilities */}
      <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-col gap-5">
          <SectionCard title="Base stats" icon={<Zap className="h-4 w-4" />}>
            <StatBars pokemon={active} accent={cfg.color} />
          </SectionCard>
          <TypeDefenses effectiveness={effectiveness.data} isLoading={effectiveness.isLoading} />
        </div>
        <div className="flex flex-col gap-5">
          <ProfilePanel pokemon={active} species={species.data} />
          <AbilitiesPanel pokemon={active} details={abilities.byName} />
        </div>
      </div>

      {/* Locations · Names */}
      <div className="grid gap-5 lg:grid-cols-2">
        <EncountersPanel encounters={encounters.data} isLoading={encounters.isLoading} />
        <NamesPanel species={species.data} />
      </div>

      {/* Evolution */}
      <EvolutionChain chain={evolution.data} isLoading={species.isLoading || evolution.isLoading} currentId={base.id} />

      {/* Moves */}
      <MovesPanel pokemon={active} />

      {/* Sprites */}
      <SpriteGallery pokemon={active} />
    </article>
  )
}

function RarityBadge({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1.5 text-sm font-semibold backdrop-blur-sm">
      {icon}
      {label}
    </span>
  )
}

/** Previous / next dex navigation. */
function DexNav({ id }: { id: number }) {
  const prev = id > 1 ? id - 1 : null
  const next = id + 1
  return (
    <div className="flex items-center gap-1.5">
      {prev && (
        <Link
          to={`/pokemon/${prev}`}
          aria-label={`Previous Pokémon, ${formatDexId(prev)}`}
          className="grid h-11 w-11 place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
        </Link>
      )}
      <Link
        to={`/pokemon/${next}`}
        aria-label={`Next Pokémon, ${formatDexId(next)}`}
        className="grid h-11 w-11 place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
      >
        <ChevronRight className="h-5 w-5" strokeWidth={2.4} />
      </Link>
    </div>
  )
}
