import { getTypeConfig, FILTER_TYPES } from '@/constants/pokemonTypes'
import type { PokemonTypeName } from '@/types/pokemon'

export type TypeFilterValue = 'all' | PokemonTypeName

interface TypeFilterProps {
  value: TypeFilterValue
  onChange: (value: TypeFilterValue) => void
  /** Strips the control's own border/background so it can sit flush inside a shared bar. */
  bare?: boolean
  className?: string
}

/**
 * Single-select type filter. A native <select> keeps it fast, accessible and
 * keyboard-friendly — no chip row to scroll through.
 */
export function TypeFilter({ value, onChange, bare = false, className = '' }: TypeFilterProps) {
  const cfg = value !== 'all' ? getTypeConfig(value) : null

  return (
    <div className={`relative flex items-center ${className}`}>
      <span className="pointer-events-none absolute left-3.5 text-base leading-none" aria-hidden="true">
        {cfg ? cfg.emoji : '🎯'}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TypeFilterValue)}
        aria-label="Filter Pokémon by type"
        className={`h-full w-full cursor-pointer appearance-none truncate py-3 pl-9 pr-8 text-sm font-semibold text-ink outline-none transition-colors ${
          bare
            ? 'border-0 bg-transparent'
            : 'rounded-[var(--radius-control)] border border-border bg-surface shadow-[var(--shadow-sm)] hover:border-border-strong'
        }`}
      >
        <option value="all">All types</option>
        {FILTER_TYPES.map((type) => (
          <option key={type} value={type}>
            {getTypeConfig(type).label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-muted"
        viewBox="0 0 12 8"
        fill="none"
        aria-hidden="true"
      >
        <path d="M1 1.5 6 6.5l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
