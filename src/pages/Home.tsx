import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { Outlet } from "react-router-dom";
import { Heart } from "lucide-react";
import { HeroDock } from "@/components/layout/HeroDock";
import {
  usePokemonIndex,
  usePokemonDetails,
  useTypeMembers,
} from "@/hooks/usePokemonData";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAppStore } from "@/store/useAppStore";
import { slugify } from "@/services/pokemonApi";
import {
  getSortOption,
  type SortDirection,
  type SortKey,
} from "@/constants/sort";
import { getStat } from "@/utils/pokemon";
import type { PokemonIndexEntry } from "@/types/pokemon";
import { PageContainer } from "@/components/layout/PageContainer";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { SearchBar } from "@/components/search/SearchBar";
import {
  TypeFilter,
  type TypeFilterValue,
} from "@/components/filters/TypeFilter";
import { SortControl } from "@/components/filters/SortControl";
import { PokemonGrid } from "@/components/pokemon/PokemonGrid";
import { CardSkeletonGrid } from "@/components/states/CardSkeleton";
import { ErrorState } from "@/components/states/ErrorState";
import { EmptyState } from "@/components/states/EmptyState";
import { Button } from "@/components/ui/Button";
import { PokeballSpinner } from "@/components/ui/PokeballSpinner";

const PAGE_SIZE = 20;

export function Home() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<TypeFilterValue>("all");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [direction, setDirection] = useState<SortDirection>("asc");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [visiblePages, setVisiblePages] = useState(1);

  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const favorites = useAppStore((s) => s.favorites);

  const index = usePokemonIndex();
  const typeMembers = useTypeMembers(type);

  // Tracks whether the hero has scrolled past the top of the viewport, so the
  // compact filter bar can take over search/filter access.
  const heroEndRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const el = heroEndRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setIsCompact(!entry.isIntersecting),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Reset pagination whenever the result set (not just its order) changes.
  useEffect(() => {
    setVisiblePages(1);
  }, [debouncedSearch, type, favoritesOnly]);

  /** Names -> index entries, filtered by favourites, type and search. */
  const filteredEntries = useMemo<PokemonIndexEntry[]>(() => {
    if (!index.data) return [];
    let entries = index.data;

    if (favoritesOnly) {
      const favSet = new Set(favorites);
      entries = entries.filter((e) => favSet.has(e.id));
    }

    if (type !== "all" && typeMembers.data) {
      const typeSet = new Set(typeMembers.data.map((e) => e.name));
      entries = entries.filter((e) => typeSet.has(e.name));
    }

    if (debouncedSearch) {
      const q = slugify(debouncedSearch);
      const asNumber = Number(debouncedSearch);
      entries = entries.filter(
        (e) =>
          e.name.includes(q) ||
          (Number.isFinite(asNumber) && e.id === asNumber),
      );
    }

    // id / name sorts run at the index level (no details required)
    const opt = getSortOption(sortKey);
    if (!opt.statKey) {
      entries = [...entries].sort((a, b) => {
        const cmp =
          sortKey === "name" ? a.name.localeCompare(b.name) : a.id - b.id;
        return direction === "asc" ? cmp : -cmp;
      });
    }

    return entries;
  }, [
    index.data,
    typeMembers.data,
    favoritesOnly,
    favorites,
    type,
    debouncedSearch,
    sortKey,
    direction,
  ]);

  const pagedEntries = useMemo(
    () => filteredEntries.slice(0, visiblePages * PAGE_SIZE),
    [filteredEntries, visiblePages],
  );

  const { pokemon, isLoading: detailsLoading } =
    usePokemonDetails(pagedEntries);

  /** Stat sorts operate on the resolved window; id/name keep index order. */
  const displayPokemon = useMemo(() => {
    const opt = getSortOption(sortKey);
    if (!opt.statKey) return pokemon;
    const statKey = opt.statKey;
    return [...pokemon].sort((a, b) => {
      const cmp = getStat(a, statKey) - getStat(b, statKey);
      return direction === "asc" ? cmp : -cmp;
    });
  }, [pokemon, sortKey, direction]);

  const handleSortKeyChange = (key: SortKey) => {
    setSortKey(key);
    setDirection(getSortOption(key).defaultDir);
  };

  const hasMore = pagedEntries.length < filteredEntries.length;
  const pendingCount = Math.max(0, pagedEntries.length - pokemon.length);
  const initialLoading =
    index.isLoading || (type !== "all" && typeMembers.isLoading);
  const searching = search.trim() !== debouncedSearch;
  const toggleFavoritesOnly = () => setFavoritesOnly((v) => !v);

  return (
    <>
      <Hero
        search={search}
        onSearch={setSearch}
        searching={searching}
        type={type}
        onTypeChange={setType}
        sortKey={sortKey}
        direction={direction}
        onSortKeyChange={handleSortKeyChange}
        onDirectionToggle={() =>
          setDirection((d) => (d === "asc" ? "desc" : "asc"))
        }
        favoritesOnly={favoritesOnly}
        onToggleFavorites={toggleFavoritesOnly}
        resultCount={filteredEntries.length}
        showCount={!initialLoading}
        sentinelRef={heroEndRef}
      />

      <CompactFilterBar
        visible={isCompact}
        search={search}
        onSearch={setSearch}
        searching={searching}
        type={type}
        onTypeChange={setType}
        favoritesOnly={favoritesOnly}
        favoritesCount={favorites.length}
        onToggleFavorites={toggleFavoritesOnly}
      />

      <PageContainer id="pokedex-grid" className="pb-28 pt-6">
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
              setSearch("");
              setType("all");
              setFavoritesOnly(false);
            }}
          />
        ) : (
          <>
            <PokemonGrid pokemon={displayPokemon} pendingCount={pendingCount} />

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <Button
                  variant="danger"
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
                    "Load more"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </PageContainer>

      {/* Pokédex detail modal renders here when the URL is /pokemon/:name */}
      <Outlet />
    </>
  );
}

interface HeroProps {
  search: string;
  onSearch: (v: string) => void;
  searching: boolean;
  type: TypeFilterValue;
  onTypeChange: (v: TypeFilterValue) => void;
  sortKey: SortKey;
  direction: SortDirection;
  onSortKeyChange: (key: SortKey) => void;
  onDirectionToggle: () => void;
  favoritesOnly: boolean;
  onToggleFavorites: () => void;
  resultCount: number;
  showCount: boolean;
  sentinelRef: RefObject<HTMLDivElement | null>;
}

function Hero({
  search,
  onSearch,
  searching,
  type,
  onTypeChange,
  sortKey,
  direction,
  onSortKeyChange,
  onDirectionToggle,
  favoritesOnly,
  onToggleFavorites,
  resultCount,
  showCount,
  sentinelRef,
}: HeroProps) {
  return (
    <section className="relative flex min-h-[440px] flex-col overflow-hidden border-b border-border sm:min-h-[500px]">
      {/* Full-bleed art + theme-aware center spotlight so content stays legible */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero_bg.jpg')" }}
        />
        <div className="hero-scrim absolute inset-0" aria-hidden="true" />
      </div>

      <PageContainer className="flex flex-1 flex-col pb-9 pt-6 sm:pb-11 sm:pt-8">
        <div className="flex items-center justify-center">
          <HeroDock
            favoritesOnly={favoritesOnly}
            onToggleFavorites={onToggleFavorites}
          />
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center">
          <div
            className="hero-rise text-center"
            style={{ animationDelay: "60ms" }}
          >
            <HeroTitle />
            <p className="mx-auto mt-4 max-w-md text-base font-medium text-ink-soft sm:text-lg">
              Search, filter and compare every Pokémon — stats, types, abilities
              and moves, in one fast field guide.
            </p>
          </div>

          <div
            className="hero-rise mx-auto mt-7 w-full max-w-xl sm:mt-8"
            style={{ animationDelay: "140ms" }}
          >
            <FilterBar
              search={search}
              onSearch={onSearch}
              searching={searching}
              type={type}
              onTypeChange={onTypeChange}
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <SortControl
                sortKey={sortKey}
                direction={direction}
                onSortKeyChange={onSortKeyChange}
                onDirectionToggle={onDirectionToggle}
              />
              {showCount && (
                <p
                  className="tabular text-sm font-semibold text-ink-soft"
                  aria-live="polite"
                >
                  {resultCount.toLocaleString()} Pokémon
                </p>
              )}
            </div>
            {getSortOption(sortKey).statKey && (
              <p className="mx-auto mt-3 w-fit max-w-full rounded-full border border-border bg-surface/90 px-3 py-1.5 text-center text-xs font-medium text-ink-soft shadow-[var(--shadow-sm)] backdrop-blur-sm sm:mx-0 sm:text-left">
                Stat sorts order the Pokémon loaded so far — use “Load more” to rank a wider set.
              </p>
            )}
          </div>
        </div>
      </PageContainer>

      {/* Once this edge scrolls under the sticky header, the compact bar takes over */}
      <div
        ref={sentinelRef}
        className="absolute inset-x-0 bottom-0 h-px"
        aria-hidden="true"
      />
    </section>
  );
}

/**
 * The hero wordmark — the Pokéxplore brand logo. Falls back to a styled text
 * wordmark if the asset is ever missing.
 */
function HeroTitle() {
  const [logoFailed, setLogoFailed] = useState(false);
  if (logoFailed) {
    return (
      <h1 className="font-display text-4xl font-black leading-none tracking-tight text-ink sm:text-5xl md:text-6xl">
        Poké<span className="text-primary">xplore</span>
      </h1>
    );
  }
  return (
    <h1 className="flex justify-center">
      <img
        src="/Pokexplore_logo.png"
        alt="Pokéxplore"
        draggable={false}
        onError={() => setLogoFailed(true)}
        className="h-20 w-auto object-contain drop-shadow-[0_4px_14px_rgba(0,0,0,0.3)] sm:h-24 md:h-30"
      />
    </h1>
  );
}

/** The type-dropdown + search field, merged into one bordered bar. Reused full-size in the hero and compact in the sticky bar. */
function FilterBar({
  search,
  onSearch,
  searching,
  type,
  onTypeChange,
}: {
  search: string;
  onSearch: (v: string) => void;
  searching: boolean;
  type: TypeFilterValue;
  onTypeChange: (v: TypeFilterValue) => void;
}) {
  return (
    <div className="flex overflow-hidden rounded-[var(--radius-control)] border border-border bg-surface shadow-[var(--shadow-sm)]">
      <TypeFilter
        value={type}
        onChange={onTypeChange}
        bare
        className="w-[9.5rem] shrink-0 sm:w-44"
      />
      <div className="w-px shrink-0 bg-border" />
      <SearchBar value={search} onChange={onSearch} loading={searching} bare />
    </div>
  );
}

/** Favourites toggle + theme toggle, grouped top-right in both the hero and the compact bar. */
function QuickActions({
  favoritesOnly,
  favoritesCount,
  onToggleFavorites,
}: {
  favoritesOnly: boolean;
  favoritesCount: number;
  onToggleFavorites: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggleFavorites}
        aria-pressed={favoritesOnly}
        aria-label={favoritesOnly ? "Show all Pokémon" : "Show favourites only"}
        className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-all duration-200 active:scale-90 ${
          favoritesOnly
            ? "border-transparent bg-danger text-white"
            : "border-border bg-surface text-muted hover:border-border-strong hover:text-ink"
        }`}
      >
        <Heart
          className="h-[18px] w-[18px]"
          fill={favoritesOnly ? "currentColor" : "none"}
          strokeWidth={2.2}
        />
        {favoritesCount > 0 && (
          <span className="tabular absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {favoritesCount}
          </span>
        )}
      </button>
      <ThemeToggle />
    </div>
  );
}

/** Compact sticky filter bar — fades in under the header once the hero scrolls away, so search/filter stay reachable. */
function CompactFilterBar({
  visible,
  search,
  onSearch,
  searching,
  type,
  onTypeChange,
  favoritesOnly,
  favoritesCount,
  onToggleFavorites,
}: {
  visible: boolean;
  search: string;
  onSearch: (v: string) => void;
  searching: boolean;
  type: TypeFilterValue;
  onTypeChange: (v: TypeFilterValue) => void;
  favoritesOnly: boolean;
  favoritesCount: number;
  onToggleFavorites: () => void;
}) {
  return (
    <div
      className={`fixed inset-x-0 top-0 z-30 border-b border-border bg-bg/90 shadow-[var(--shadow-sm)] backdrop-blur-xl transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-2 opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <PageContainer className="flex items-center gap-3 py-2.5">
        <div className="min-w-0 flex-1">
          <FilterBar
            search={search}
            onSearch={onSearch}
            searching={searching}
            type={type}
            onTypeChange={onTypeChange}
          />
        </div>
        <QuickActions
          favoritesOnly={favoritesOnly}
          favoritesCount={favoritesCount}
          onToggleFavorites={onToggleFavorites}
        />
      </PageContainer>
    </div>
  );
}

function EmptyResults({
  favoritesOnly,
  search,
  onClear,
}: {
  favoritesOnly: boolean;
  search: string;
  onClear: () => void;
}) {
  if (favoritesOnly) {
    return (
      <EmptyState
        icon={<Heart className="h-8 w-8" strokeWidth={1.75} />}
        title="No favourites yet"
        body="Tap the heart on any Pokémon to keep it here for quick access."
        action={<Button onClick={onClear}>Browse all Pokémon</Button>}
      />
    );
  }
  return (
    <EmptyState
      title="No Pokémon found"
      body={
        search
          ? `We couldn't find anything matching “${search}”. Try another name or dex number.`
          : "No Pokémon match these filters. Try clearing them."
      }
      action={<Button onClick={onClear}>Clear filters</Button>}
    />
  );
}
