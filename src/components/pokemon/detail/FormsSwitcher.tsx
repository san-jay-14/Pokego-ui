import { Shuffle } from 'lucide-react'
import type { PokemonVariety } from '@/types/pokemon'
import { formatFormLabel } from '@/utils/species'

interface FormsSwitcherProps {
  varieties: PokemonVariety[]
  baseName: string
  active: string
  onSelect: (name: string) => void
}

/** Pills to switch between a species' alternate forms (Mega, Gigantamax, regional). */
export function FormsSwitcher({ varieties, baseName, active, onSelect }: FormsSwitcherProps) {
  if (varieties.length <= 1) return null

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-card)] border border-border bg-surface p-3 shadow-[var(--shadow-sm)]">
      <span className="flex items-center gap-1.5 pl-1 pr-1 text-xs font-semibold uppercase tracking-wide text-muted">
        <Shuffle className="h-3.5 w-3.5" />
        Forms
      </span>
      {varieties.map((v) => {
        const name = v.pokemon.name
        const isActive = name === active
        return (
          <button
            key={name}
            type="button"
            onClick={() => onSelect(name)}
            aria-pressed={isActive}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              isActive
                ? 'bg-primary text-primary-ink shadow-[var(--shadow-sm)]'
                : 'border border-border text-muted hover:border-border-strong hover:text-ink'
            }`}
          >
            {formatFormLabel(name, baseName)}
          </button>
        )
      })}
    </div>
  )
}
