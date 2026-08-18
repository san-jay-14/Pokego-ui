# Pokédex — Field Index

A production-quality Pokémon Explorer built on the [PokéAPI](https://pokeapi.co/).
Search, filter, sort and compare every Pokémon in a fast, polished field guide with a
distinctive **type-aura** design language, full light/dark theming and careful attention
to loading, error and empty states.

> **Design thesis** — a premium digital field guide crossed with a sleek scanner readout.
> Every card and detail hero is lit by a soft radial glow tinted by the Pokémon's primary
> type, with the dex number set as an oversized collector's-index numeral. The type colours
> carry the energy; everything around them stays quiet and disciplined.

## Features

**Core**

- **Browse** — responsive card grid, 20 Pokémon per page via **Load More** (appends, never replaces)
- **Search** — instant substring search across the entire dex (name or dex number), debounced
- **Type filter** — filter by any of the 18 types; horizontally scrollable on mobile, wraps on desktop
- **Detail pages** — large artwork, types, height, weight, abilities (incl. hidden), animated base-stat bars and move list, at a shareable URL (`/pokemon/pikachu`)
- **Type-based styling** — centralized type configuration drives colours, gradients and glyphs everywhere
- **States** — skeleton loaders with shimmer, actionable error states with retry, and helpful empty states
- **Responsive** — designed mobile-first for 375px → 1920px with no horizontal overflow
- **Accessible** — semantic HTML, keyboard support (Tab/Enter/Escape), visible focus, ARIA labels, `prefers-reduced-motion`

**Bonus**

- ⭐ **Favourites** — persisted to `localStorage`, with a favourites-only view
- 🌙 **Dark mode** — intentionally designed light and dark themes (not an inversion), persisted
- ↕️ **Sorting** — by dex number, name, attack, speed or HP, with direction toggle
- ⚖️ **Compare** — pick two Pokémon and compare their base stats side by side
- 🔗 **URL-based navigation** — detail pages are directly shareable and deep-linkable

## Tech Stack

| Concern         | Choice                                   |
| --------------- | ---------------------------------------- |
| Framework       | React 19 + TypeScript                    |
| Build tool      | Vite 6                                    |
| Styling         | Tailwind CSS v4 (CSS-first design tokens) |
| Data fetching   | TanStack Query v5 (caching, dedupe)      |
| Client state    | Zustand (persisted: theme, favourites, compare) |
| Routing         | React Router v7                          |
| Icons           | Lucide React                             |

## API Used

[**PokéAPI v2**](https://pokeapi.co/docs/v2) — no authentication required.

| Endpoint                     | Used for                                   |
| ---------------------------- | ------------------------------------------ |
| `GET /pokemon?limit&offset`  | The full lightweight dex index (cached once) |
| `GET /pokemon/{name\|id}`    | Full details for cards, detail pages, compare |
| `GET /type/{type}`           | Members of a type for the type filter      |

All network access lives in [`src/services/pokemonApi.ts`](src/services/pokemonApi.ts) and is
consumed through the hooks in [`src/hooks`](src/hooks). Every failure is normalized into a typed
`ApiError` (`not-found` / `network` / `http` / `malformed`) so the UI can respond precisely.

## Installation

Requires Node 18+ (developed on Node 22/25).

```bash
npm install
```

## Running Locally

```bash
npm run dev      # start the dev server at http://localhost:5173
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## Project Structure

```
src/
├── components/
│   ├── layout/       Header, PageContainer, ThemeToggle, ScrollToTop
│   ├── pokemon/      PokemonCard, PokemonGrid, TypeBadge, StatBars, PokemonArtwork
│   ├── search/       SearchBar
│   ├── filters/      TypeFilter, SortControl
│   ├── states/       CardSkeleton, DetailSkeleton, ErrorState, EmptyState
│   ├── favorites/    FavoriteButton
│   ├── compare/      CompareTray, CompareView
│   └── ui/           Button, Modal, PokeballSpinner
├── pages/            Home, PokemonDetail, NotFound
├── services/         pokemonApi.ts        (all fetch calls + typed errors)
├── hooks/            usePokemonData, useDebouncedValue, useThemeEffect
├── store/            useAppStore.ts       (Zustand: theme, favourites, compare)
├── constants/        pokemonTypes.ts, sort.ts
├── types/            pokemon.ts           (PokéAPI response types)
├── utils/            pokemon.ts           (formatting, artwork, stats)
├── lib/              queryClient.ts
├── App.tsx  ·  main.tsx  ·  index.css     (design tokens)
```

### Data architecture

A single pipeline powers browsing, search, filter and sort:

1. The full dex **index** (name + id) is fetched once and cached for the session.
2. That index is filtered by favourites → type → search, then sorted (id/name sort at the
   index level; stat sorts on the resolved window).
3. Details for the visible window are fetched in parallel via TanStack Query's `useQueries`,
   cached independently and **shared** with the detail page and compare view.

This avoids refetching, request waterfalls and fetching everything up front, while keeping
search responsive across all ~1,300 Pokémon.

## Challenges Faced

- **Listing needs details the list endpoint doesn't return.** `GET /pokemon` returns only
  names and URLs — no types or artwork. Solved by fetching a cached index once and resolving
  per-Pokémon details lazily for the visible window, deduped and cached by React Query.
- **Search across the whole dex without hammering the API.** Rather than firing a request per
  keystroke, the cached index enables instant client-side substring search, with details
  fetched only for matches actually shown.
- **Sorting by stats when the list has no stats.** Id/name sorts run on the index; stat sorts
  apply to the resolved window that Load More grows — a predictable model for a Load-More UX.
- **A theme system that isn't just inverted colours.** Semantic CSS variables define light and
  dark independently and flow into Tailwind v4's `@theme`, so both themes are tuned by hand.

## Future Improvements

- Virtualized grid for very large filtered sets
- Evolution chains and type-matchup (weakness/resistance) data on the detail page
- Shareable compare URLs (`/compare/pikachu/charizard`)
- Optional infinite scroll alongside Load More
- Offline caching via a service worker

## Screenshots

_Add screenshots of the home grid, a detail page, dark mode and the compare view here._

## Live Demo

_Add the deployed URL here (e.g. Vercel / Netlify)._
