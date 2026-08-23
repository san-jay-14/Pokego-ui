import type { Pokemon } from '@/types/pokemon'
import type { CardEnrichment } from '@/utils/species'
import { PokemonCard } from './PokemonCard'
import { CardSkeleton } from '@/components/states/CardSkeleton'

interface PokemonGridProps {
  pokemon: Pokemon[]
  /** Trailing skeleton cards shown while the next batch resolves. */
  pendingCount?: number
  /** Batched card-flavor data by dex id, from `useWindowEnrichment`. */
  enrichment?: Map<number, CardEnrichment>
}

/** Responsive card grid. Resolved cards render first; pending ones as skeletons. */
export function PokemonGrid({ pokemon, pendingCount = 0, enrichment }: PokemonGridProps) {
  return (
    <div className="card-grid">
      {pokemon.map((p, i) => (
        <PokemonCard key={p.id} pokemon={p} index={i} enrichment={enrichment?.get(p.id)} />
      ))}
      {Array.from({ length: pendingCount }).map((_, i) => (
        <CardSkeleton key={`skeleton-${i}`} />
      ))}
    </div>
  )
}
