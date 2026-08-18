import { useEffect, useState } from 'react'
import type { Pokemon } from '@/types/pokemon'
import { MAX_STAT, STAT_META, getStat, totalStats } from '@/utils/pokemon'

interface StatBarsProps {
  pokemon: Pokemon
  /** Bar colour — the Pokémon's primary type colour. */
  accent: string
}

/** Base-stat bars that grow in on mount (and appear instantly under reduced-motion). */
export function StatBars({ pokemon, accent }: StatBarsProps) {
  const [grown, setGrown] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div className="flex flex-col gap-3.5">
      {STAT_META.map((meta) => {
        const value = getStat(pokemon, meta.key)
        const pct = Math.min(100, Math.round((value / MAX_STAT) * 100))
        return (
          <div key={meta.key} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <span className="w-16 text-xs font-semibold uppercase tracking-wide text-muted">
              {meta.label}
            </span>
            <span
              className="relative h-2.5 overflow-hidden rounded-full"
              style={{ backgroundColor: 'var(--surface-inset)' }}
              role="meter"
              aria-valuenow={value}
              aria-valuemin={0}
              aria-valuemax={MAX_STAT}
              aria-label={`${meta.label} ${value}`}
            >
              <span
                className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-[var(--ease-smooth)]"
                style={{
                  width: grown ? `${pct}%` : '0%',
                  background: `linear-gradient(90deg, color-mix(in srgb, ${accent} 70%, ${accent}), ${accent})`,
                }}
              />
            </span>
            <span className="tabular w-9 text-right text-sm font-bold text-ink">{value}</span>
          </div>
        )
      })}

      <div className="mt-1 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Total</span>
        <span className="tabular text-sm font-bold text-ink">{totalStats(pokemon)}</span>
      </div>
    </div>
  )
}
