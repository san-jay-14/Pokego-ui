import { Link } from 'react-router-dom'
import type { Pokemon } from '@/types/pokemon'
import { getTypeConfig } from '@/constants/pokemonTypes'
import { MAX_STAT, STAT_META, formatDexId, formatName, getArtwork, getStat, primaryType, totalStats } from '@/utils/pokemon'

interface CompareViewProps {
  a: Pokemon
  b: Pokemon
}

/** Side-by-side base-stat comparison of two Pokémon. */
export function CompareView({ a, b }: CompareViewProps) {
  return (
    <div>
      <div className="grid grid-cols-[72px_1fr_1fr] items-end gap-3 sm:grid-cols-[96px_1fr_1fr]">
        <span />
        <CompareHead pokemon={a} />
        <CompareHead pokemon={b} />
      </div>

      <div className="mt-4 flex flex-col divide-y divide-border">
        {STAT_META.map((meta) => {
          const va = getStat(a, meta.key)
          const vb = getStat(b, meta.key)
          return (
            <div
              key={meta.key}
              className="grid grid-cols-[72px_1fr_1fr] items-center gap-3 py-2.5 sm:grid-cols-[96px_1fr_1fr]"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                {meta.label}
              </span>
              <StatCell value={va} opponent={vb} accent={getTypeConfig(primaryType(a)).color} align="left" />
              <StatCell value={vb} opponent={va} accent={getTypeConfig(primaryType(b)).color} align="left" />
            </div>
          )
        })}

        <div className="grid grid-cols-[72px_1fr_1fr] items-center gap-3 py-3 sm:grid-cols-[96px_1fr_1fr]">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Total</span>
          <TotalCell value={totalStats(a)} opponent={totalStats(b)} />
          <TotalCell value={totalStats(b)} opponent={totalStats(a)} />
        </div>
      </div>
    </div>
  )
}

function CompareHead({ pokemon }: { pokemon: Pokemon }) {
  const cfg = getTypeConfig(primaryType(pokemon))
  return (
    <Link to={`/pokemon/${pokemon.name}`} className="group flex flex-col items-center text-center">
      <span
        className="grid h-20 w-20 place-items-center rounded-2xl sm:h-24 sm:w-24"
        style={{ background: `radial-gradient(circle at 50% 30%, ${cfg.glow}, transparent 70%)` }}
      >
        <img
          src={getArtwork(pokemon)}
          alt={formatName(pokemon.name)}
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = '/pokeball.svg'
            e.currentTarget.classList.add('opacity-40')
          }}
          className="h-16 w-16 object-contain transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20"
          draggable={false}
        />
      </span>
      <span className="mt-1.5 text-sm font-bold text-ink">{formatName(pokemon.name)}</span>
      <span className="tabular text-xs text-faint">{formatDexId(pokemon.id)}</span>
    </Link>
  )
}

interface StatCellProps {
  value: number
  opponent: number
  accent: string
  align: 'left'
}

function StatCell({ value, opponent, accent }: StatCellProps) {
  const wins = value > opponent
  const pct = Math.min(100, Math.round((value / MAX_STAT) * 100))
  return (
    <div className="flex flex-col gap-1">
      <span className={`tabular text-sm font-bold ${wins ? 'text-ink' : 'text-muted'}`}>
        {value}
      </span>
      <span className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--surface-inset)' }}>
        <span
          className="block h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: wins ? accent : 'var(--faint)' }}
        />
      </span>
    </div>
  )
}

function TotalCell({ value, opponent }: { value: number; opponent: number }) {
  const wins = value > opponent
  return (
    <span
      className={`tabular text-base font-bold ${wins ? 'text-primary' : 'text-muted'}`}
    >
      {value}
      {wins && <span className="ml-1 text-xs">▲</span>}
    </span>
  )
}
