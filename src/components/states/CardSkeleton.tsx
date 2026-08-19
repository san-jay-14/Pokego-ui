/** Skeleton placeholder matching the trading-card footprint. */
export function CardSkeleton() {
  return (
    <div className="aspect-[63/88] overflow-hidden rounded-[6%] border border-border bg-surface p-[4.5%] shadow-[var(--shadow-sm)]">
      <div className="flex h-full flex-col rounded-[4%] bg-surface-2 p-[6%]">
        <div className="flex items-start justify-between">
          <div className="skeleton h-3 w-1/2 rounded" />
          <div className="skeleton h-3 w-8 rounded" />
        </div>
        <div className="skeleton mt-[6%] aspect-[1.5/1] w-full rounded-[3px]" />
        <div className="skeleton mt-[6%] h-3 w-full rounded" />
        <div className="skeleton mt-[6%] h-3 w-3/4 rounded" />
        <div className="mt-auto flex justify-between gap-2">
          <div className="skeleton h-4 w-1/4 rounded" />
          <div className="skeleton h-4 w-1/4 rounded" />
          <div className="skeleton h-4 w-1/4 rounded" />
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
