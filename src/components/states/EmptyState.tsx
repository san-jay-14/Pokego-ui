import { SearchX } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title?: string
  body?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

/** Reusable empty-results panel for search / filter combinations that match nothing. */
export function EmptyState({
  title = 'No Pokémon found',
  body = 'Try a different name or clear your filters to see more.',
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`animate-float-in mx-auto flex max-w-sm flex-col items-center px-6 py-16 text-center ${className}`}
    >
      <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-surface-2 text-muted shadow-[var(--shadow-sm)]">
        {icon ?? <SearchX className="h-8 w-8" strokeWidth={1.75} />}
      </div>
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
