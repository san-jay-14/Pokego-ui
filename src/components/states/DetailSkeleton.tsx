/** Skeleton mirroring the Pokémon detail layout (hero + section cards). */
export function DetailSkeleton() {
  return (
    <div className="animate-float-in" aria-hidden="true">
      <div className="skeleton h-64 rounded-[var(--radius-card)] sm:h-72" />
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6">
          <div className="skeleton mb-5 h-5 w-28 rounded-md" />
          <div className="flex flex-col gap-3.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton h-3 w-14 rounded" />
                <div className="skeleton h-2.5 flex-1 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6">
            <div className="skeleton mb-4 h-5 w-24 rounded-md" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-16 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6">
            <div className="skeleton mb-4 h-5 w-20 rounded-md" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton h-7 w-20 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
