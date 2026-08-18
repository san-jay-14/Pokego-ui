import type { StatKey } from '@/types/pokemon'

export type SortKey = 'id' | 'name' | 'attack' | 'speed' | 'hp'
export type SortDirection = 'asc' | 'desc'

export interface SortOption {
  key: SortKey
  label: string
  /** Stat sorts need details resolved; id/name can sort the raw index. */
  statKey?: StatKey
  /** The natural default direction when this key is chosen. */
  defaultDir: SortDirection
}

export const SORT_OPTIONS: SortOption[] = [
  { key: 'id', label: 'Dex number', defaultDir: 'asc' },
  { key: 'name', label: 'Name', defaultDir: 'asc' },
  { key: 'attack', label: 'Attack', statKey: 'attack', defaultDir: 'desc' },
  { key: 'speed', label: 'Speed', statKey: 'speed', defaultDir: 'desc' },
  { key: 'hp', label: 'HP', statKey: 'hp', defaultDir: 'desc' },
]

export function getSortOption(key: SortKey): SortOption {
  return SORT_OPTIONS.find((o) => o.key === key) ?? SORT_OPTIONS[0]
}
