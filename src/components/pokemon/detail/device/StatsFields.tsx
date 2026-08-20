import type { Pokemon } from '@/types/pokemon'
import { STAT_META, getStat, totalStats } from '@/utils/pokemon'

interface StatsFieldsProps {
  pokemon: Pokemon
  size?: 'normal' | 'compact'
}

/**
 * Base stats as the classic dot-leader terminal readout — "HP..........78" —
 * in the device's pixel font, no bars.
 */
export function StatsFields({ pokemon, size = 'normal' }: StatsFieldsProps) {
  const compact = size === 'compact'
  return (
    <div className="flex flex-col">
      {STAT_META.map((meta) => {
        const value = getStat(pokemon, meta.key)
        return <DotLine key={meta.key} label={meta.label} value={value} compact={compact} />
      })}
      <div className={`border-t-2 border-dashed border-[#26340f]/30 ${compact ? 'mt-0.5 pt-0.5' : 'mt-1 pt-1'}`}>
        <DotLine label="Total" value={totalStats(pokemon)} bold compact={compact} />
      </div>
    </div>
  )
}

function DotLine({
  label,
  value,
  bold = false,
  compact = false,
}: {
  label: string
  value: number
  bold?: boolean
  compact?: boolean
}) {
  return (
    <div
      className={`flex items-baseline gap-1 ${compact ? 'text-[0.82rem] leading-[1.4]' : 'text-base leading-tight sm:text-lg'} ${
        bold ? 'font-bold' : ''
      }`}
    >
      <span className="uppercase">{label}</span>
      <span className="flex-1 translate-y-[-0.3em] overflow-hidden whitespace-nowrap tracking-[0.25em] opacity-60" aria-hidden="true">
        ..........................................................
      </span>
      <span className="tabular">{value}</span>
    </div>
  )
}
