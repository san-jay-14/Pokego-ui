import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

/** Max Pokémon that can sit in the compare tray at once. */
export const COMPARE_LIMIT = 2

interface AppState {
  theme: Theme
  favorites: number[] // dex ids
  compare: number[] // dex ids, max COMPARE_LIMIT

  toggleTheme: () => void
  setTheme: (theme: Theme) => void

  toggleFavorite: (id: number) => void
  isFavorite: (id: number) => boolean

  toggleCompare: (id: number) => void
  isComparing: (id: number) => boolean
  clearCompare: () => void
}

/** Prefer the OS colour scheme the first time the app is opened. */
function initialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: initialTheme(),
      favorites: [],
      compare: [],

      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),

      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),
      isFavorite: (id) => get().favorites.includes(id),

      toggleCompare: (id) =>
        set((s) => {
          if (s.compare.includes(id)) {
            return { compare: s.compare.filter((c) => c !== id) }
          }
          if (s.compare.length >= COMPARE_LIMIT) {
            // replace the oldest so the tray always tracks the two latest picks
            return { compare: [...s.compare.slice(1), id] }
          }
          return { compare: [...s.compare, id] }
        }),
      isComparing: (id) => get().compare.includes(id),
      clearCompare: () => set({ compare: [] }),
    }),
    {
      name: 'pokedex-field-index',
      partialize: (s) => ({ theme: s.theme, favorites: s.favorites, compare: s.compare }),
    },
  ),
)
