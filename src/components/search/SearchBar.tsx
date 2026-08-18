import { useRef } from 'react'
import { Search, X } from 'lucide-react'
import { PokeballSpinner } from '@/components/ui/PokeballSpinner'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  loading?: boolean
  placeholder?: string
}

/**
 * Prominent search field. Escape clears, the clear button resets, and a
 * spinner replaces the icon while a lookup is resolving.
 */
export function SearchBar({
  value,
  onChange,
  loading = false,
  placeholder = 'Search Pokémon…',
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="group relative w-full">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary">
        {loading ? (
          <PokeballSpinner size={18} className="text-primary" />
        ) : (
          <Search className="h-[18px] w-[18px]" strokeWidth={2.2} />
        )}
      </span>

      <input
        ref={inputRef}
        type="search"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && value) {
            e.preventDefault()
            onChange('')
          }
        }}
        placeholder={placeholder}
        aria-label="Search Pokémon by name or dex number"
        className="h-13 w-full rounded-[var(--radius-control)] border border-border bg-surface py-3.5 pl-12 pr-11 text-base font-medium text-ink shadow-[var(--shadow-sm)] outline-none transition-[border-color,box-shadow] placeholder:text-faint focus:border-primary/60 focus:shadow-[0_0_0_4px_var(--primary-soft)] [&::-webkit-search-cancel-button]:hidden"
      />

      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('')
            inputRef.current?.focus()
          }}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <X className="h-[18px] w-[18px]" strokeWidth={2.4} />
        </button>
      )}
    </div>
  )
}
