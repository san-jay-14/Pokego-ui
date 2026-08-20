import { ArrowDown, ArrowUp, ArrowUpDown, Check } from 'lucide-react'
import {
  SORT_OPTIONS,
  getSortOption,
  type SortDirection,
  type SortKey,
} from '@/constants/sort'
import { Dropdown } from '@/components/ui/Dropdown'

interface SortControlProps {
  sortKey: SortKey
  direction: SortDirection
  onSortKeyChange: (key: SortKey) => void
  onDirectionToggle: () => void
}

/** Sort-key popover plus a direction toggle, styled to match the app's controls. */
export function SortControl({
  sortKey,
  direction,
  onSortKeyChange,
  onDirectionToggle,
}: SortControlProps) {
  const active = getSortOption(sortKey)

  return (
    <div className="flex items-stretch gap-2">
      <Dropdown
        align="start"
        label="Sort Pokémon by"
        panelClassName="w-52 max-w-[calc(100vw-1rem)]"
        renderTrigger={({ toggle, open, triggerRef }) => (
          <button
            ref={triggerRef}
            type="button"
            onClick={toggle}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label="Sort Pokémon by"
            className="relative flex h-11 items-center gap-2 rounded-[var(--radius-control)] border border-border bg-surface pl-3.5 pr-9 text-sm font-semibold text-ink shadow-[var(--shadow-sm)] outline-none transition-colors hover:border-border-strong focus-visible:border-primary/60"
          >
            <ArrowUpDown className="h-4 w-4 text-muted" strokeWidth={2.2} />
            <span className="truncate">{active.label}</span>
            <Chevron
              open={open}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
            />
          </button>
        )}
      >
        {(close) => (
          <div className="flex flex-col gap-0.5">
            {SORT_OPTIONS.map((opt) => {
              const selected = opt.key === sortKey
              return (
                <button
                  key={opt.key}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onSortKeyChange(opt.key)
                    close()
                  }}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors ${
                    selected
                      ? 'bg-primary-soft text-primary'
                      : 'text-ink hover:bg-surface-2'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {selected && <Check className="ml-auto h-4 w-4" strokeWidth={2.6} />}
                </button>
              )
            })}
          </div>
        )}
      </Dropdown>

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
