/** Skeleton placeholder matching the PokemonCard footprint. */
export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-sm)]">
      <div className="flex aspect-square items-center justify-center p-6">
        <div className="skeleton h-24 w-24 rounded-full" />
      </div>
      <div className="flex flex-col gap-2.5 px-4 pb-4 pt-1">
        <div className="skeleton h-4 w-2/3 rounded-md" />
        <div className="flex gap-1.5">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-12 rounded-full" />
        </div>
      </div>
    </div>
  )
}

/** A run of card skeletons for the grid's loading state. */
export function CardSkeletonGrid({ count = 10 }: { count?: number }) {
  return (
    <div className="card-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
