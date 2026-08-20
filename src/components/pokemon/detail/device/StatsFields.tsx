import type { Pokemon } from '@/types/pokemon'
import { MAX_STAT, STAT_META, getStat, totalStats } from '@/utils/pokemon'

interface StatsFieldsProps {
  pokemon: Pokemon
  size?: 'normal' | 'compact'
}

/**
 * Base stats as proportional LCD bars — a filled dark-green segment sized to
 * each stat's value so magnitudes read at a glance, with the exact number on
 * the right. Rendered in the device's pixel font to stay on-theme.
 */
export function StatsFields({ pokemon, size = 'normal' }: StatsFieldsProps) {
  const compact = size === 'compact'
  return (
    <div className="flex flex-col">
      {STAT_META.map((meta) => (
        <StatBar
          key={meta.key}
          label={meta.label}
          value={getStat(pokemon, meta.key)}
          compact={compact}
        />
      ))}
      <div className={`border-t-2 border-dashed border-[#26340f]/30 ${compact ? 'mt-0.5 pt-0.5' : 'mt-1 pt-1'}`}>
        <StatBar label="Total" value={totalStats(pokemon)} max={STAT_META.length * MAX_STAT} bold compact={compact} />
      </div>
    </div>
  )
}

function StatBar({
  label,
  value,
  max = MAX_STAT,
  bold = false,
  compact = false,
}: {
  label: string
  value: number
  max?: number
  bold?: boolean
  compact?: boolean
}) {
  const pct = Math.max(2, Math.min(100, (value / max) * 100))
  return (
    <div
      className={`flex items-center gap-1.5 ${compact ? 'text-[0.82rem] leading-[1.5]' : 'text-base leading-snug sm:text-lg'} ${
        bold ? 'font-bold' : ''
      }`}
    >
      <span className={`shrink-0 uppercase ${compact ? 'w-9' : 'w-12'}`}>{label}</span>
      <span
        className="relative h-2 flex-1 overflow-hidden rounded-[2px] border border-[#26340f]/25 bg-[#26340f]/10"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label} ${value}`}
      >
        <span
          className="absolute inset-y-0 left-0 rounded-[1px] bg-[#26340f]/70 transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="tabular w-8 shrink-0 text-right">{value}</span>
    </div>
  )
}
