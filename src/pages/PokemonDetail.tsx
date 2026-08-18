import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Ruler, Sparkles, Weight, Zap } from 'lucide-react'
import type { Pokemon } from '@/types/pokemon'
import { usePokemonDetail } from '@/hooks/usePokemonData'
import { getTypeConfig } from '@/constants/pokemonTypes'
import {
  formatDexId,
  formatHeight,
  formatName,
  formatWeight,
  getArtwork,
  primaryType,
} from '@/utils/pokemon'
import { PageContainer } from '@/components/layout/PageContainer'
import { StatBars } from '@/components/pokemon/StatBars'
import { FavoriteButton } from '@/components/favorites/FavoriteButton'
import { DetailSkeleton } from '@/components/states/DetailSkeleton'
import { ErrorState } from '@/components/states/ErrorState'
import { Button } from '@/components/ui/Button'
import { ApiError } from '@/services/pokemonApi'

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

      {data && !isLoading && <DetailContent pokemon={data} />}
    </PageContainer>
  )
}

function DetailContent({ pokemon }: { pokemon: Pokemon }) {
  const cfg = getTypeConfig(primaryType(pokemon))
  const abilities = pokemon.abilities
  const moves = pokemon.moves.slice(0, 14)

  return (
    <article className="animate-float-in">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-[var(--radius-card)] px-6 py-7 text-white shadow-[var(--shadow-lg)] sm:px-10 sm:py-9"
        style={{ background: `linear-gradient(135deg, ${cfg.from}, ${cfg.to})` }}
      >
        {/* Contrast scrim — guarantees white text is legible on light-type gradients */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/15 via-black/25 to-black/45"
        />
        {/* Watermark */}
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="pointer-events-none absolute -right-10 -top-12 h-64 w-64 opacity-15"
        >
          <circle cx="50" cy="50" r="46" fill="none" stroke="white" strokeWidth="4" />
          <path d="M4 50h30a16 16 0 0 1 32 0h30" fill="none" stroke="white" strokeWidth="4" />
          <circle cx="50" cy="50" r="11" fill="white" />
        </svg>
        <span
          aria-hidden="true"
          className="tabular pointer-events-none absolute -bottom-6 right-4 select-none text-[9rem] font-bold leading-none text-white/10"
        >
          {String(pokemon.id).padStart(3, '0')}
        </span>

        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-10">
          <div className="relative shrink-0">
            <div
              className="absolute inset-0 -z-10 rounded-full blur-2xl"
              style={{ background: 'rgba(255,255,255,0.35)' }}
            />
            <img
              src={getArtwork(pokemon)}
              alt={formatName(pokemon.name)}
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = '/pokeball.svg'
                e.currentTarget.classList.add('opacity-40')
              }}
              className="h-44 w-44 object-contain drop-shadow-[0_16px_24px_rgba(0,0,0,0.3)] sm:h-56 sm:w-56"
              draggable={false}
            />
          </div>

          <div
            className="flex flex-1 flex-col items-center text-center sm:items-start sm:text-left"
            style={{ textShadow: '0 2px 14px rgba(0,0,0,0.35)' }}
          >
            <span className="tabular text-sm font-bold uppercase tracking-[0.2em] text-white/80">
              {formatDexId(pokemon.id)}
            </span>
            <h1 className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
              {formatName(pokemon.name)}
            </h1>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              {pokemon.types.map((t) => (
                <span
                  key={t.type.name}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-sm font-semibold backdrop-blur-sm"
                >
                  <span aria-hidden="true">{getTypeConfig(t.type.name).emoji}</span>
                  {getTypeConfig(t.type.name).label}
                </span>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-2">
              <FavoriteButton id={pokemon.id} name={pokemon.name} size="md" />
              <DexNav id={pokemon.id} />
            </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <SectionCard title="Base stats" icon={<Zap className="h-4 w-4" />}>
          <StatBars pokemon={pokemon} accent={cfg.color} />
        </SectionCard>

        <div className="flex flex-col gap-5">
          <SectionCard title="Overview" icon={<Sparkles className="h-4 w-4" />}>
            <div className="grid grid-cols-2 gap-3">
              <InfoTile icon={<Ruler className="h-4 w-4" />} label="Height" value={formatHeight(pokemon.height)} />
              <InfoTile icon={<Weight className="h-4 w-4" />} label="Weight" value={formatWeight(pokemon.weight)} />
              <InfoTile
                icon={<Zap className="h-4 w-4" />}
                label="Base exp"
                value={pokemon.base_experience?.toString() ?? '—'}
              />
              <InfoTile
                icon={<Sparkles className="h-4 w-4" />}
                label="Abilities"
                value={abilities.length.toString()}
              />
            </div>

            <div className="mt-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Abilities
              </h4>
              <div className="flex flex-wrap gap-2">
                {abilities.map((a) => (
                  <span
                    key={a.ability.name}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-sm font-medium capitalize text-ink"
                  >
                    {formatName(a.ability.name)}
                    {a.is_hidden && (
                      <span className="rounded bg-primary-soft px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase text-primary">
                        Hidden
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Moves" icon={<Zap className="h-4 w-4" />} subtitle={`${pokemon.moves.length} total`}>
            {moves.length === 0 ? (
              <p className="text-sm text-muted">No move data available.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {moves.map((m) => (
                  <span
                    key={m.move.name}
                    className="rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs font-medium capitalize text-ink-soft"
                  >
                    {formatName(m.move.name)}
                  </span>
                ))}
                {pokemon.moves.length > moves.length && (
                  <span className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted">
                    +{pokemon.moves.length - moves.length} more
                  </span>
                )}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </article>
  )
}

function SectionCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string
  subtitle?: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-bold text-ink">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-soft text-primary">
            {icon}
          </span>
          {title}
        </h3>
        {subtitle && <span className="text-xs font-medium text-muted">{subtitle}</span>}
      </div>
      {children}
    </section>
  )
}

function InfoTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-muted">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="tabular mt-1 text-lg font-bold text-ink">{value}</p>
    </div>
  )
}

/** Previous / next dex navigation. Wraps within the classic 1..1025 range. */
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
