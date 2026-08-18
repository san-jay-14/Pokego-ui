import { memo } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Scale } from 'lucide-react'
import type { Pokemon } from '@/types/pokemon'
import { getTypeConfig } from '@/constants/pokemonTypes'
import { formatDexId, formatName, getArtwork, primaryType } from '@/utils/pokemon'
import { TypeBadge } from './TypeBadge'
import { FavoriteButton } from '@/components/favorites/FavoriteButton'
import { useAppStore } from '@/store/useAppStore'

interface PokemonCardProps {
  pokemon: Pokemon
  /** Stagger index for the entrance animation. */
  index?: number
}

/**
 * The product's signature surface: a type-aura card with an oversized ghost
 * dex numeral, a watermark Pokéball, and artwork that lifts out on hover.
 */
export const PokemonCard = memo(function PokemonCard({ pokemon, index = 0 }: PokemonCardProps) {
  const cfg = getTypeConfig(primaryType(pokemon))
  const isComparing = useAppStore((s) => s.compare.includes(pokemon.id))
  const toggleCompare = useAppStore((s) => s.toggleCompare)

  return (
    <Link
      to={`/pokemon/${pokemon.name}`}
      aria-label={`${formatName(pokemon.name)}, ${formatDexId(pokemon.id)}`}
      className="group animate-pop-in relative block overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-sm)] transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-smooth)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-lg)] focus-visible:-translate-y-1.5"
      style={
        {
          animationDelay: `${Math.min(index, 12) * 35}ms`,
          '--type': cfg.color,
        } as CSSProperties
      }
    >
      {/* Type aura — radial glow, intensifies on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(120% 80% at 50% -10%, ${cfg.glow}, transparent 60%)`,
        }}
      />
      {/* Bottom colour wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 opacity-25"
        style={{
          background: `linear-gradient(to top, ${cfg.from}, transparent)`,
        }}
      />
      {/* Watermark Pokéball */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 opacity-[0.07] transition-transform duration-500 ease-[var(--ease-smooth)] group-hover:rotate-45"
        style={{ color: cfg.color }}
      >
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="6" />
        <path d="M4 50h30a16 16 0 0 1 32 0h30" fill="none" stroke="currentColor" strokeWidth="6" />
        <circle cx="50" cy="50" r="10" fill="currentColor" />
      </svg>

      {/* Ghost dex numeral */}
      <span
        aria-hidden="true"
        className="tabular pointer-events-none absolute left-3 top-1 select-none text-5xl font-bold leading-none"
        style={{ color: 'var(--ghost)' }}
      >
        {String(pokemon.id).padStart(3, '0')}
      </span>

      {/* Corner controls */}
      <div className="absolute right-2.5 top-2.5 z-10 flex flex-col gap-1.5 opacity-90 transition-opacity group-hover:opacity-100">
        <FavoriteButton id={pokemon.id} name={pokemon.name} />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleCompare(pokemon.id)
          }}
          aria-pressed={isComparing}
          aria-label={isComparing ? `Remove ${pokemon.name} from compare` : `Add ${pokemon.name} to compare`}
          className={`grid h-9 w-9 place-items-center rounded-full border backdrop-blur-sm transition-all duration-200 active:scale-90 ${
            isComparing
              ? 'border-transparent bg-primary text-primary-ink'
              : 'border-border bg-surface/70 text-muted hover:text-primary hover:border-primary/40'
          }`}
        >
          <Scale className="h-[17px] w-[17px]" strokeWidth={2.2} />
        </button>
      </div>

      {/* Artwork */}
      <div className="relative flex aspect-square items-center justify-center px-5 pt-6">
        <img
          src={getArtwork(pokemon)}
          alt={formatName(pokemon.name)}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = '/pokeball.svg'
            e.currentTarget.classList.add('opacity-30', 'p-6')
          }}
          className="h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-[var(--ease-smooth)] group-hover:scale-110 group-hover:-rotate-2"
        />
      </div>

      {/* Meta */}
      <div className="relative flex flex-col gap-2 px-4 pb-4 pt-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate text-base font-bold text-ink sm:text-lg">
            {formatName(pokemon.name)}
          </h3>
          <span className="tabular shrink-0 text-xs font-semibold text-faint">
            {formatDexId(pokemon.id)}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {pokemon.types.map((t) => (
            <TypeBadge key={t.type.name} type={t.type.name} />
          ))}
        </div>
      </div>
    </Link>
  )
})
