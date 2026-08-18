import type { ReactNode } from 'react'
import { Sparkles } from 'lucide-react'
import { FILTER_TYPES, getTypeConfig } from '@/constants/pokemonTypes'
import type { PokemonTypeName } from '@/types/pokemon'

export type TypeFilterValue = 'all' | PokemonTypeName

interface TypeFilterProps {
  value: TypeFilterValue
  onChange: (value: TypeFilterValue) => void
}

/**
 * Type filter chips. Scrolls horizontally on mobile (no wasted vertical space)
 * and wraps into a tidy grid on wider screens. The active chip adopts its
 * type colour so the current filter is unmistakable.
 */
export function TypeFilter({ value, onChange }: TypeFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filter Pokémon by type"
      className="no-scrollbar -mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 md:flex-wrap md:overflow-visible"
    >
      <FilterChip
        active={value === 'all'}
        onClick={() => onChange('all')}
        label="All"
        icon={<Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} />}
      />

      {FILTER_TYPES.map((type) => {
        const cfg = getTypeConfig(type)
        const active = value === type
        return (
          <FilterChip
            key={type}
            active={active}
            onClick={() => onChange(type)}
            label={cfg.label}
            icon={<span aria-hidden="true">{cfg.emoji}</span>}
            activeColor={cfg.color}
            activeInk={cfg.onColor}
          />
        )
      })}
    </div>
  )
}

interface FilterChipProps {
  active: boolean
  onClick: () => void
  label: string
  icon: ReactNode
  activeColor?: string
  activeInk?: string
}

function FilterChip({ active, onClick, label, icon, activeColor, activeInk }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 snap-start items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-semibold transition-all duration-200 active:scale-95 ${
        active
          ? 'border-transparent text-primary-ink shadow-[var(--shadow-sm)]'
          : 'border-border bg-surface text-muted hover:border-border-strong hover:text-ink'
      }`}
      style={
        active
          ? { backgroundColor: activeColor ?? 'var(--primary)', color: activeInk ?? 'var(--primary-ink)' }
          : undefined
      }
    >
      {icon}
      {label}
    </button>
  )
}
