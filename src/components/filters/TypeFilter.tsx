import { Check } from 'lucide-react'
import { getTypeConfig, FILTER_TYPES } from '@/constants/pokemonTypes'
import type { PokemonTypeName } from '@/types/pokemon'
import { Dropdown } from '@/components/ui/Dropdown'

export type TypeFilterValue = 'all' | PokemonTypeName

interface TypeFilterProps {
  value: TypeFilterValue
  onChange: (value: TypeFilterValue) => void
  /** Strips the control's own border/background so it can sit flush inside a shared bar. */
  bare?: boolean
  className?: string
}

/**
 * Single-select type filter rendered as a custom popover: the trigger shows the
 * active type, and the panel lays every type out as a colour-coded grid.
 */
export function TypeFilter({ value, onChange, bare = false, className = '' }: TypeFilterProps) {
  const cfg = value !== 'all' ? getTypeConfig(value) : null

  return (
    <Dropdown
      align="start"
      label="Filter Pokémon by type"
      panelClassName="w-[19.5rem] max-w-[calc(100vw-1rem)]"
      renderTrigger={({ toggle, open, triggerRef }) => (
        <button
          ref={triggerRef}
          type="button"
          onClick={toggle}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Filter Pokémon by type"
          className={`relative flex items-center gap-2 py-3 pl-3.5 pr-8 text-sm font-semibold text-ink outline-none transition-colors focus-visible:text-primary ${className} ${
            bare
              ? 'w-full bg-transparent'
              : 'rounded-[var(--radius-control)] border border-border bg-surface shadow-[var(--shadow-sm)] hover:border-border-strong'
          }`}
        >
          <span className="text-base leading-none" aria-hidden="true">
            {cfg ? cfg.emoji : '🎯'}
          </span>
          <span className="truncate">{cfg ? cfg.label : 'All types'}</span>
          <Chevron
            open={open}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          />
        </button>
      )}
    >
      {(close) => {
        const select = (v: TypeFilterValue) => {
          onChange(v)
          close()
        }
        return (
          <>
            <button
              type="button"
              role="option"
              aria-selected={value === 'all'}
              onClick={() => select('all')}
              className={`mb-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-bold transition-colors ${
                value === 'all'
                  ? 'bg-ink text-bg'
                  : 'text-ink hover:bg-surface-2'
              }`}
            >
              <span aria-hidden="true">🎯</span>
              All types
              {value === 'all' && <Check className="ml-auto h-4 w-4" strokeWidth={2.6} />}
            </button>

            <div className="grid grid-cols-3 gap-1">
              {FILTER_TYPES.map((type) => {
                const c = getTypeConfig(type)
                const selected = value === type
                return (
                  <button
                    key={type}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => select(type)}
                    title={c.label}
                    style={{
                      background: selected
                        ? `linear-gradient(135deg, ${c.from}, ${c.to})`
                        : `color-mix(in srgb, ${c.color} 14%, var(--surface))`,
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition-transform active:scale-95 ${
                      selected
                        ? 'text-white shadow-[var(--shadow-sm)] ring-1 ring-white/40'
                        : 'text-ink hover:brightness-[1.06]'
                    }`}
                  >
                    <span className="shrink-0 text-sm leading-none" aria-hidden="true">
                      {c.emoji}
                    </span>
                    <span className="truncate">{c.label}</span>
                  </button>
                )
              })}
            </div>
          </>
        )
      }}
    </Dropdown>
  )
}

function Chevron({ open, className = '' }: { open: boolean; className?: string }) {
  return (
    <svg
      className={`h-3.5 w-3.5 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''} ${className}`}
      viewBox="0 0 12 8"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 1.5 6 6.5l5-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
