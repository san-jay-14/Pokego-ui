import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { usePokemonIndex } from '@/hooks/usePokemonData'
import { slugify } from '@/services/pokemonApi'
import { artworkFromId, formatDexId, formatName } from '@/utils/pokemon'
import { PokeballSpinner } from '@/components/ui/PokeballSpinner'

interface FighterPickerProps {
  /** Ids already on the field — filtered out and shown as disabled. */
  chosen: number[]
  onPick: (id: number) => void
}

/** Searchable combatant picker used on the Battlefield's empty slots. */
export function FighterPicker({ chosen, onPick }: FighterPickerProps) {
  const [query, setQuery] = useState('')
  const index = usePokemonIndex()

  const results = useMemo(() => {
    if (!index.data) return []
    const q = slugify(query.trim())
    const asNumber = Number(query)
    const list = query
      ? index.data.filter(
          (e) => e.name.includes(q) || (Number.isFinite(asNumber) && e.id === asNumber),
        )
      : index.data
    return list.slice(0, 24)
  }, [index.data, query])

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
          {index.isLoading ? <PokeballSpinner size={18} /> : <Search className="h-[18px] w-[18px]" strokeWidth={2.2} />}
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a challenger…"
          aria-label="Search a Pokémon to add to the battle"
          className="h-12 w-full rounded-[var(--radius-control)] border border-border bg-surface pl-12 pr-11 text-base font-medium text-ink shadow-[var(--shadow-sm)] outline-none transition-[border-color,box-shadow] placeholder:text-faint focus:border-primary/60 focus:shadow-[0_0_0_4px_var(--primary-soft)] [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={2.4} />
          </button>
        )}
      </div>

      <div className="no-scrollbar mt-2 max-h-64 overflow-y-auto rounded-[var(--radius-control)] border border-border bg-surface p-1.5 shadow-[var(--shadow-sm)]">
        {index.isLoading ? (
          <p className="px-3 py-6 text-center text-sm text-muted">Loading Pokédex…</p>
        ) : results.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted">No Pokémon match “{query}”.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-1">
            {results.map((e) => {
              const picked = chosen.includes(e.id)
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    disabled={picked}
                    onClick={() => onPick(e.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <img
                      src={artworkFromId(e.id)}
                      alt=""
                      loading="lazy"
                      className="h-8 w-8 shrink-0 object-contain"
                      draggable={false}
                      onError={(ev) => {
                        ev.currentTarget.src = '/pokeball.svg'
                        ev.currentTarget.classList.add('opacity-40')
                      }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {formatName(e.name)}
                      </span>
                      <span className="tabular text-xs text-faint">{formatDexId(e.id)}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
