import type { ReactNode } from 'react'

/** A titled panel used for each block on the detail page. */
export function SectionCard({
  title,
  subtitle,
  icon,
  children,
  className = '',
}: {
  title: string
  subtitle?: ReactNode
  icon: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] ${className}`}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-base font-bold text-ink">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
            {icon}
          </span>
          {title}
        </h3>
        {subtitle && <span className="shrink-0 text-xs font-medium text-muted">{subtitle}</span>}
      </div>
      {children}
    </section>
  )
}

/** A compact labelled value tile (height, weight, catch rate, …). */
export function InfoTile({
  icon,
  label,
  value,
}: {
  icon?: ReactNode
  label: string
  value: ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-muted">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="tabular mt-1 text-base font-bold text-ink">{value}</p>
    </div>
  )
}
