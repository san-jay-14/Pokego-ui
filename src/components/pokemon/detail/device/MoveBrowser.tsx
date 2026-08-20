import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { Pokemon } from '@/types/pokemon'
import { getTypeConfig } from '@/constants/pokemonTypes'
import { formatName } from '@/utils/pokemon'
import { getMovesByMethod, type LearnMethod, type LearnMove } from '@/utils/species'
import { useMoveDetails } from '@/hooks/usePokemonData'
import { EnergyPip } from '@/components/pokemon/EnergyPip'
import { LcdScreen } from './LcdScreen'

const METHODS: { method: LearnMethod; label: string }[] = [
  { method: 'level-up', label: 'Level' },
  { method: 'machine', label: 'TM' },
  { method: 'egg', label: 'Egg' },
  { method: 'tutor', label: 'Tutor' },
]

/** A single-move browser with ▲▼ steppers, echoing the classic device's move screen. */
export function MoveBrowser({ pokemon }: { pokemon: Pokemon }) {
  const byMethod = useMemo(() => {
    const map = {} as Record<LearnMethod, LearnMove[]>
    for (const m of METHODS) map[m.method] = getMovesByMethod(pokemon, m.method)
    return map
  }, [pokemon])

  const available = METHODS.filter((m) => byMethod[m.method].length > 0)
  const [method, setMethod] = useState<LearnMethod>('level-up')
  const activeMethod = available.some((a) => a.method === method) ? method : available[0]?.method ?? 'level-up'
  const moves = useMemo(() => byMethod[activeMethod] ?? [], [byMethod, activeMethod])

  const [index, setIndex] = useState(0)
  const safeIndex = moves.length ? Math.min(index, moves.length - 1) : 0
  const current = moves[safeIndex]

  const names = useMemo(() => moves.map((m) => m.name), [moves])
  const { byName } = useMoveDetails(names)
  const detail = current ? byName.get(current.name) : undefined
  const cfg = detail ? getTypeConfig(detail.type.name) : null

  const step = (delta: number) => {
    if (!moves.length) return
    setIndex((i) => {
      const next = Math.min(moves.length - 1, Math.max(0, Math.min(i, moves.length - 1) + delta))
      return next
    })
  }

  const changeMethod = (m: LearnMethod) => {
    setMethod(m)
    setIndex(0)
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Method selector */}
      <div className="flex flex-wrap gap-1.5">
        {available.map((m) => (
          <button
            key={m.method}
            type="button"
            onClick={() => changeMethod(m.method)}
            aria-pressed={activeMethod === m.method}
            className={`rounded-md border px-2 py-0.5 text-xs font-bold uppercase tracking-wide transition-colors ${
              activeMethod === m.method
                ? 'border-white/40 bg-[#f7ecd0] text-[#5f0d10]'
                : 'border-black/25 bg-black/20 text-white/80 hover:bg-black/30'
            }`}
          >
            {m.label}
            <span className="ml-1 opacity-70">{byMethod[m.method].length}</span>
          </button>
        ))}
      </div>

      <div className="flex items-stretch gap-2">
        <LcdScreen className="flex-1 px-3.5 py-2">
          {!current ? (
            <p className="text-base" style={{ fontFamily: 'var(--font-lcd)' }}>
              No known moves
            </p>
          ) : (
            <div style={{ fontFamily: 'var(--font-lcd)' }}>
              <div className="mb-1 flex items-baseline justify-between gap-2 border-b-2 border-[#26340f]/30 pb-0.5">
                <span className="truncate text-lg leading-none">{formatName(current.name)}</span>
                <span className="tabular shrink-0 text-xs opacity-70">
                  {safeIndex + 1}/{moves.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <DottedLine label="Power" value={detail?.power ?? '—'} />
                <DottedLine label="Acc" value={detail?.accuracy != null ? `${detail.accuracy}` : '—'} />
                <DottedLine label="PP" value={detail?.pp ?? '—'} />
                <DottedLine
                  label="Learn"
                  value={current.level != null ? (current.level === 0 ? '—' : `Lv ${current.level}`) : 'TM'}
                />
              </div>
              <div className="mt-1 flex items-center gap-2 border-t-2 border-[#26340f]/30 pt-1 text-base">
                <span className="opacity-70">TYPE</span>
                {cfg && detail ? (
                  <span className="inline-flex items-center gap-1.5">
                    <EnergyPip type={detail.type.name} size={15} />
                    <span className="uppercase">{cfg.label}</span>
                  </span>
                ) : (
                  <span className="opacity-60">…</span>
                )}
              </div>
            </div>
          )}
        </LcdScreen>

        {/* ▲▼ steppers */}
        <div className="flex flex-col justify-center gap-2">
          <StepButton onClick={() => step(-1)} disabled={safeIndex <= 0} label="Previous move">
            <ChevronUp className="h-4 w-4" strokeWidth={2.6} />
          </StepButton>
          <StepButton onClick={() => step(1)} disabled={safeIndex >= moves.length - 1} label="Next move">
            <ChevronDown className="h-4 w-4" strokeWidth={2.6} />
          </StepButton>
        </div>
      </div>
    </div>
  )
}

function DottedLine({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline gap-1 text-[0.9rem] leading-[1.3]">
      <span className="uppercase opacity-80">{label}</span>
      <span className="flex-1 translate-y-[-0.3em] border-b-2 border-dotted border-[#26340f]/35" />
      <span className="tabular">{value}</span>
    </div>
  )
}

function StepButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="groove-control grid h-8 w-8 place-items-center rounded-full bg-black/20 text-white/85 transition-transform active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  )
}
