import type { Pokemon } from '@/types/pokemon'
import { PokemonCard } from './PokemonCard'
import { CardSkeleton } from '@/components/states/CardSkeleton'

interface PokemonGridProps {
  pokemon: Pokemon[]
  /** Trailing skeleton cards shown while the next batch resolves. */
  pendingCount?: number
}

/** Responsive card grid. Resolved cards render first; pending ones as skeletons. */
export function PokemonGrid({ pokemon, pendingCount = 0 }: PokemonGridProps) {
  return (
    <div className="card-grid">
      {pokemon.map((p, i) => (
        <PokemonCard key={p.id} pokemon={p} index={i} />
      ))}
      {Array.from({ length: pendingCount }).map((_, i) => (
        <CardSkeleton key={`skeleton-${i}`} />
      ))}
    </div>
  )
}
