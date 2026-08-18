import { useEffect, useMemo, useState } from 'react'
import { Heart } from 'lucide-react'
import { usePokemonIndex, usePokemonDetails, useTypeMembers } from '@/hooks/usePokemonData'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useAppStore } from '@/store/useAppStore'
import { slugify } from '@/services/pokemonApi'
import { getSortOption, type SortDirection, type SortKey } from '@/constants/sort'
import { getStat } from '@/utils/pokemon'
import type { PokemonIndexEntry } from '@/types/pokemon'
import { PageContainer } from '@/components/layout/PageContainer'
import { SearchBar } from '@/components/search/SearchBar'
import { TypeFilter, type TypeFilterValue } from '@/components/filters/TypeFilter'
import { SortControl } from '@/components/filters/SortControl'
import { PokemonGrid } from '@/components/pokemon/PokemonGrid'
import { CardSkeletonGrid } from '@/components/states/CardSkeleton'
import { ErrorState } from '@/components/states/ErrorState'
import { EmptyState } from '@/components/states/EmptyState'
import { Button } from '@/components/ui/Button'
import { PokeballSpinner } from '@/components/ui/PokeballSpinner'

const PAGE_SIZE = 20

export function Home() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState<TypeFilterValue>('all')
  const [sortKey, setSortKey] = useState<SortKey>('id')
  const [direction, setDirection] = useState<SortDirection>('asc')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [visiblePages, setVisiblePages] = useState(1)

  const debouncedSearch = useDebouncedValue(search.trim(), 300)
  const favorites = useAppStore((s) => s.favorites)

  const index = usePokemonIndex()
  const typeMembers = useTypeMembers(type)

  // Reset pagination whenever the result set (not just its order) changes.
  useEffect(() => {
    setVisiblePages(1)
  }, [debouncedSearch, type, favoritesOnly])

  /** Names -> index entries, filtered by favourites, type and search. */
  const filteredEntries = useMemo<PokemonIndexEntry[]>(() => {
    if (!index.data) return []
    let entries = index.data

    if (favoritesOnly) {
      const favSet = new Set(favorites)
      entries = entries.filter((e) => favSet.has(e.id))
    }

    if (type !== 'all' && typeMembers.data) {
      const typeSet = new Set(typeMembers.data.map((e) => e.name))
      entries = entries.filter((e) => typeSet.has(e.name))
    }

    if (debouncedSearch) {
      const q = slugify(debouncedSearch)
      const asNumber = Number(debouncedSearch)
      entries = entries.filter(
        (e) => e.name.includes(q) || (Number.isFinite(asNumber) && e.id === asNumber),
      )
    }

    // id / name sorts run at the index level (no details required)
    const opt = getSortOption(sortKey)
    if (!opt.statKey) {
      entries = [...entries].sort((a, b) => {
        const cmp = sortKey === 'name' ? a.name.localeCompare(b.name) : a.id - b.id
        return direction === 'asc' ? cmp : -cmp
      })
    }

    return entries
  }, [index.data, typeMembers.data, favoritesOnly, favorites, type, debouncedSearch, sortKey, direction])

  const pagedEntries = useMemo(
    () => filteredEntries.slice(0, visiblePages * PAGE_SIZE),
    [filteredEntries, visiblePages],
  )

  const { pokemon, isLoading: detailsLoading } = usePokemonDetails(pagedEntries)

  /** Stat sorts operate on the resolved window; id/name keep index order. */
  const displayPokemon = useMemo(() => {
    const opt = getSortOption(sortKey)
    if (!opt.statKey) return pokemon
    const statKey = opt.statKey
    return [...pokemon].sort((a, b) => {
      const cmp = getStat(a, statKey) - getStat(b, statKey)
      return direction === 'asc' ? cmp : -cmp
    })
  }, [pokemon, sortKey, direction])

  const handleSortKeyChange = (key: SortKey) => {
    setSortKey(key)
    setDirection(getSortOption(key).defaultDir)
  }

  const hasMore = pagedEntries.length < filteredEntries.length
  const pendingCount = Math.max(0, pagedEntries.length - pokemon.length)
  const initialLoading = index.isLoading || (type !== 'all' && typeMembers.isLoading)
  const searching = search.trim() !== debouncedSearch

  return (
    <>
      <Hero
        search={search}
        onSearch={setSearch}
        searching={searching}
        totalIndexed={index.data?.length ?? 0}
      />

      <PageContainer className="pb-28 pt-2">
        {/* Controls */}
        <div className="mb-6 flex flex-col gap-4">
          <TypeFilter value={type} onChange={setType} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SortControl
                sortKey={sortKey}
                direction={direction}
                onSortKeyChange={handleSortKeyChange}
                onDirectionToggle={() => setDirection((d) => (d === 'asc' ? 'desc' : 'asc'))}
              />
              <button
                type="button"
                onClick={() => setFavoritesOnly((v) => !v)}
                aria-pressed={favoritesOnly}
                className={`inline-flex h-11 items-center gap-2 rounded-[var(--radius-control)] border px-4 text-sm font-semibold transition-colors ${
                  favoritesOnly
                    ? 'border-transparent bg-danger/12 text-danger'
                    : 'border-border bg-surface text-muted hover:text-ink'
                }`}
              >
                <Heart className="h-4 w-4" fill={favoritesOnly ? 'currentColor' : 'none'} strokeWidth={2.2} />
                <span className="hidden sm:inline">Favourites</span>
                {favorites.length > 0 && (
                  <span className="tabular rounded-full bg-surface-inset px-1.5 text-xs">
                    {favorites.length}
                  </span>
                )}
              </button>
            </div>

            {!initialLoading && (
              <p className="tabular text-sm font-medium text-muted" aria-live="polite">
                {filteredEntries.length.toLocaleString()}{' '}
                {filteredEntries.length === 1 ? 'Pokémon' : 'Pokémon'}
              </p>
            )}
          </div>
        </div>

        {/* Body */}
        {index.isError ? (
          <ErrorState error={index.error} onRetry={() => index.refetch()} />
        ) : initialLoading ? (
          <CardSkeletonGrid count={PAGE_SIZE} />
        ) : filteredEntries.length === 0 ? (
          <EmptyResults
            favoritesOnly={favoritesOnly}
            search={debouncedSearch}
            onClear={() => {
              setSearch('')
              setType('all')
              setFavoritesOnly(false)
            }}
          />
        ) : (
          <>
            <PokemonGrid pokemon={displayPokemon} pendingCount={pendingCount} />

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setVisiblePages((p) => p + 1)}
                  disabled={detailsLoading}
                  className="min-w-44"
                >
                  {detailsLoading ? (
                    <>
                      <PokeballSpinner size={18} />
                      Loading…
                    </>
                  ) : (
                    'Load more'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </PageContainer>
    </>
  )
}

interface HeroProps {
  search: string
  onSearch: (v: string) => void
  searching: boolean
  totalIndexed: number
}

function Hero({ search, onSearch, searching, totalIndexed }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <PageContainer className="pb-6 pt-8 sm:pt-12">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3.5 py-1.5 text-xs font-semibold text-muted backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            {totalIndexed > 0 ? `${totalIndexed.toLocaleString()} Pokémon indexed` : 'Live PokéAPI data'}
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl">
            Explore the{' '}
            <span className="bg-gradient-to-r from-primary to-[#8b5cf6] bg-clip-text text-transparent">
              Pokédex
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-muted sm:text-lg">
            Search, filter and compare every Pokémon — stats, types, abilities and moves, in one fast field guide.
          </p>
          <div className="mx-auto mt-6 max-w-xl">
            <SearchBar value={search} onChange={onSearch} loading={searching} />
          </div>
        </div>
      </PageContainer>
    </section>
  )
}

function EmptyResults({
  favoritesOnly,
  search,
  onClear,
}: {
  favoritesOnly: boolean
  search: string
  onClear: () => void
}) {
  if (favoritesOnly) {
    return (
      <EmptyState
        icon={<Heart className="h-8 w-8" strokeWidth={1.75} />}
        title="No favourites yet"
        body="Tap the heart on any Pokémon to keep it here for quick access."
        action={<Button onClick={onClear}>Browse all Pokémon</Button>}
      />
    )
  }
  return (
    <EmptyState
      title="No Pokémon found"
      body={
        search
          ? `We couldn't find anything matching “${search}”. Try another name or dex number.`
          : 'No Pokémon match these filters. Try clearing them.'
      }
      action={<Button onClick={onClear}>Clear filters</Button>}
    />
  )
}
