import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { SORT_OPTIONS, type SortDirection, type SortKey } from '@/constants/sort'

interface SortControlProps {
  sortKey: SortKey
  direction: SortDirection
  onSortKeyChange: (key: SortKey) => void
  onDirectionToggle: () => void
}

/** Sort key selector plus a direction toggle. Native <select> keeps it accessible. */
export function SortControl({
  sortKey,
  direction,
  onSortKeyChange,
  onDirectionToggle,
}: SortControlProps) {
  return (
    <div className="flex items-stretch gap-2">
      <div className="relative flex items-center">
        <ArrowUpDown
          className="pointer-events-none absolute left-3 h-4 w-4 text-muted"
          strokeWidth={2.2}
        />
        <select
          value={sortKey}
          onChange={(e) => onSortKeyChange(e.target.value as SortKey)}
          aria-label="Sort Pokémon by"
          className="h-11 cursor-pointer appearance-none rounded-[var(--radius-control)] border border-border bg-surface pl-9 pr-9 text-sm font-semibold text-ink shadow-[var(--shadow-sm)] outline-none transition-colors hover:border-border-strong focus:border-primary/60"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
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

      <button
        type="button"
        onClick={onDirectionToggle}
        aria-label={`Sort ${direction === 'asc' ? 'ascending' : 'descending'} — toggle direction`}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-control)] border border-border bg-surface text-muted shadow-[var(--shadow-sm)] transition-colors hover:border-border-strong hover:text-ink"
      >
        {direction === 'asc' ? (
          <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2.4} />
        ) : (
          <ArrowDown className="h-[18px] w-[18px]" strokeWidth={2.4} />
        )}
      </button>
    </div>
  )
}
