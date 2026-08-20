import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Crown } from 'lucide-react'
import type { Pokemon, PokemonTypeName } from '@/types/pokemon'
import { getTypeConfig } from '@/constants/pokemonTypes'
import { useTypeEffectiveness } from '@/hooks/usePokemonData'
import {
  MAX_STAT,
  STAT_META,
  formatDexId,
  formatHeight,
  formatName,
  formatWeight,
  getAnimatedSprite,
  getStat,
  hasAnimatedSprite,
  primaryType,
  totalStats,
} from '@/utils/pokemon'
import type { Effectiveness, TypeEffectiveness } from '@/utils/typeEffectiveness'
import { formatMultiplier } from '@/utils/typeEffectiveness'

/** Where the diagonal seam crosses the hero — x% at the top and bottom edges. */
const SEAM_TOP = 57
const SEAM_BOTTOM = 43

interface BattleArenaProps {
  a: Pokemon
  b: Pokemon
  onRemove: (id: number) => void
}

/**
 * The full head-to-head: a diagonally split hero tinted by each fighter's type
 * with animated sprites, a centred tug-of-war stat ladder, then attributes,
 * type matchups and abilities mirrored across the divide.
 */
export function BattleArena({ a, b, onRemove }: BattleArenaProps) {
  const cfgA = getTypeConfig(primaryType(a))
  const cfgB = getTypeConfig(primaryType(b))
  const effA = useTypeEffectiveness(a.types.map((t) => t.type.name))
  const effB = useTypeEffectiveness(b.types.map((t) => t.type.name))

  const totalA = totalStats(a)
  const totalB = totalStats(b)

  return (
    <div className="flex flex-col gap-8">
      {/* Diagonal split hero */}
      <div className="battle-hero relative isolate overflow-hidden rounded-[var(--radius-card)] border border-border shadow-[var(--shadow-md)]">
        <div
          className="absolute inset-0"
          style={{
            clipPath: `polygon(0 0, ${SEAM_TOP}% 0, ${SEAM_BOTTOM}% 100%, 0 100%)`,
            background: `linear-gradient(135deg, ${cfgA.from}, ${cfgA.to})`,
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0"
          style={{
            clipPath: `polygon(${SEAM_TOP}% 0, 100% 0, 100% 100%, ${SEAM_BOTTOM}% 100%)`,
            background: `linear-gradient(225deg, ${cfgB.from}, ${cfgB.to})`,
          }}
          aria-hidden="true"
        />
        {/* Hatched seam band */}
        <div
          className="battle-seam absolute inset-0"
          style={{
            clipPath: `polygon(${SEAM_TOP}% 0, ${SEAM_TOP + 2.5}% 0, ${SEAM_BOTTOM + 2.5}% 100%, ${SEAM_BOTTOM}% 100%)`,
          }}
          aria-hidden="true"
        />

        <div className="relative grid grid-cols-2">
          <Fighter pokemon={a} side="a" onRemove={onRemove} />
          <Fighter pokemon={b} side="b" onRemove={onRemove} />
        </div>

        {/* VS emblem on the seam */}
        <span className="pointer-events-none absolute left-1/2 top-1/2 z-10 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white/70 bg-black/55 text-sm font-black italic tracking-tight text-white shadow-lg backdrop-blur-sm sm:h-14 sm:w-14 sm:text-lg">
          VS
        </span>
      </div>

      {/* Tug-of-war stats */}
      <Section title="Base stats">
        <div className="flex flex-col gap-2.5">
          {STAT_META.map((meta) => (
            <StatBattleRow
              key={meta.key}
              label={meta.short}
              va={getStat(a, meta.key)}
              vb={getStat(b, meta.key)}
              colorA={cfgA.color}
              colorB={cfgB.color}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
          <TotalEnd value={totalA} win={totalA > totalB} align="left" />
          <span className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-faint">Total</span>
          <TotalEnd value={totalB} win={totalB > totalA} align="right" />
        </div>
      </Section>

      {/* Attributes */}
      <Section title="Attributes">
        <div className="flex flex-col divide-y divide-border">
          <AttrRow label="Height" a={a.height} b={b.height} format={formatHeight} />
          <AttrRow label="Weight" a={a.weight} b={b.weight} format={formatWeight} />
          <AttrRow label="Base EXP" a={a.base_experience} b={b.base_experience} format={String} />
        </div>
      </Section>

      {/* Type matchups */}
      <Section title="Type matchups">
        <MirroredColumns
          left={<MatchupCell eff={effA.data} loading={effA.isLoading} align="right" />}
          right={<MatchupCell eff={effB.data} loading={effB.isLoading} align="left" />}
        />
      </Section>

      {/* Abilities */}
      <Section title="Abilities">
        <MirroredColumns
          left={<AbilitiesCell pokemon={a} align="right" />}
          right={<AbilitiesCell pokemon={b} align="left" />}
        />
      </Section>
    </div>
  )
}

function Fighter({
  pokemon,
  side,
  onRemove,
}: {
  pokemon: Pokemon
  side: 'a' | 'b'
  onRemove: (id: number) => void
}) {
  const isB = side === 'b'
  const animated = hasAnimatedSprite(pokemon)
  return (
    <div
      className={`relative flex flex-col items-center gap-1 px-3 py-5 sm:py-7 ${isB ? 'pl-8 sm:pl-12' : 'pr-8 sm:pr-12'}`}
    >
      <img
        src={getAnimatedSprite(pokemon)}
        alt={formatName(pokemon.name)}
        className="battle-sprite h-28 w-28 object-contain sm:h-40 sm:w-40"
        style={{
          transform: isB ? 'scaleX(-1)' : undefined,
          imageRendering: animated ? 'pixelated' : 'auto',
        }}
        draggable={false}
        onError={(e) => {
          e.currentTarget.onerror = null
          e.currentTarget.src = '/pokeball.svg'
          e.currentTarget.style.imageRendering = 'auto'
          e.currentTarget.classList.add('opacity-40')
        }}
      />
      <Link
        to={`/pokemon/${pokemon.name}`}
        className="text-base font-black uppercase tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] hover:underline sm:text-xl"
      >
        {formatName(pokemon.name)}
      </Link>
      <span className="tabular text-xs font-bold text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
        {formatDexId(pokemon.id)}
      </span>
      <div className="mt-1 flex flex-wrap justify-center gap-1">
        {pokemon.types.map((t) => (
          <TypeChip key={t.type.name} type={t.type.name} />
        ))}
      </div>
      <button
        type="button"
        onClick={() => onRemove(pokemon.id)}
        aria-label={`Remove ${formatName(pokemon.name)} from the battle`}
        className={`absolute top-2 grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white opacity-80 backdrop-blur-sm transition-all hover:bg-black/65 hover:opacity-100 active:scale-90 ${isB ? 'right-2' : 'left-2'}`}
      >
        <span className="text-lg leading-none">×</span>
      </button>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-center text-[0.7rem] font-bold uppercase tracking-[0.2em] text-faint">
        {title}
      </h3>
      {children}
    </section>
  )
}

/** Two type-mirrored columns split by a centre gutter line. */
function MirroredColumns({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="grid grid-cols-2">
      <div className="border-r border-border pr-3 sm:pr-5">{left}</div>
      <div className="pl-3 sm:pl-5">{right}</div>
    </div>
  )
}

function StatBattleRow({
  label,
  va,
  vb,
  colorA,
  colorB,
}: {
  label: string
  va: number
  vb: number
  colorA: string
  colorB: string
}) {
  const winA = va > vb
  const winB = vb > va
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
      <div className="flex items-center justify-end gap-2">
        <span className={`tabular text-sm font-bold ${winA ? 'text-ink' : 'text-muted'}`}>{va}</span>
        <span className="relative h-2.5 w-full max-w-[11rem] overflow-hidden rounded-full" style={{ backgroundColor: 'var(--surface-inset)' }}>
          <span
            className="absolute right-0 top-0 h-full rounded-full transition-[width] duration-500"
            style={{ width: `${Math.min(100, (va / MAX_STAT) * 100)}%`, backgroundColor: colorA, opacity: winA ? 1 : 0.45 }}
          />
        </span>
      </div>
      <span className="w-12 text-center text-[0.65rem] font-bold uppercase tracking-wide text-faint">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span className="relative h-2.5 w-full max-w-[11rem] overflow-hidden rounded-full" style={{ backgroundColor: 'var(--surface-inset)' }}>
          <span
            className="absolute left-0 top-0 h-full rounded-full transition-[width] duration-500"
            style={{ width: `${Math.min(100, (vb / MAX_STAT) * 100)}%`, backgroundColor: colorB, opacity: winB ? 1 : 0.45 }}
          />
        </span>
        <span className={`tabular text-sm font-bold ${winB ? 'text-ink' : 'text-muted'}`}>{vb}</span>
      </div>
    </div>
  )
}

function TotalEnd({ value, win, align }: { value: number; win: boolean; align: 'left' | 'right' }) {
  return (
    <span
      className={`tabular flex items-center gap-1 text-lg font-black ${win ? 'text-primary' : 'text-muted'} ${align === 'right' ? 'flex-row-reverse' : ''}`}
    >
      {value}
      {win && <Crown className="h-4 w-4" />}
    </span>
  )
}

function AttrRow({
  label,
  a,
  b,
  format,
}: {
  label: string
  a: number | null
  b: number | null
  format: (v: number) => string
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2.5">
      <AttrValue value={a} opponent={b} format={format} align="right" />
      <span className="w-20 text-center text-[0.65rem] font-bold uppercase tracking-wide text-faint">
        {label}
      </span>
      <AttrValue value={b} opponent={a} format={format} align="left" />
    </div>
  )
}

function AttrValue({
  value,
  opponent,
  format,
  align,
}: {
  value: number | null
  opponent: number | null
  format: (v: number) => string
  align: 'left' | 'right'
}) {
  const cls = align === 'right' ? 'text-right' : 'text-left'
  if (value == null) return <span className={`text-sm text-faint ${cls}`}>—</span>
  const bigger = opponent == null || value > opponent
  return (
    <span className={`tabular text-sm font-bold ${cls} ${bigger ? 'text-ink' : 'text-muted'}`}>
      {format(value)}
    </span>
  )
}

function MatchupCell({
  eff,
  loading,
  align,
}: {
  eff: TypeEffectiveness | undefined
  loading: boolean
  align: 'left' | 'right'
}) {
  if (loading || !eff) {
    return (
      <div className="flex flex-col gap-2">
        {[0, 1].map((i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="skeleton h-2.5 w-16 rounded" />
            <div className="skeleton h-6 w-full rounded-lg" />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2.5">
      <MatchupGroup label="Weak" tone="danger" items={eff.weak} align={align} />
      <MatchupGroup label="Resists" tone="success" items={eff.resist} align={align} />
      {eff.immune.length > 0 && (
        <MatchupGroup
          label="Immune"
          tone="muted"
          items={eff.immune.map((type) => ({ type, multiplier: 0 }))}
          align={align}
        />
      )}
    </div>
  )
}

function MatchupGroup({
  label,
  tone,
  items,
  align,
}: {
  label: string
  tone: 'danger' | 'success' | 'muted'
  items: Effectiveness[]
  align: 'left' | 'right'
}) {
  const toneClass =
    tone === 'danger' ? 'text-danger' : tone === 'success' ? 'text-success' : 'text-muted'
  const justify = align === 'right' ? 'justify-end' : 'justify-start'
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <p className={`mb-1 text-[0.65rem] font-bold uppercase tracking-wide ${toneClass}`}>{label}</p>
      {items.length === 0 ? (
        <p className="text-xs text-faint">None</p>
      ) : (
        <div className={`flex flex-wrap gap-1 ${justify}`}>
          {items.map((it) => (
            <MatchupPill key={it.type} type={it.type} multiplier={it.multiplier} />
          ))}
        </div>
      )}
    </div>
  )
}

function MatchupPill({ type, multiplier }: { type: PokemonTypeName; multiplier: number }) {
  const cfg = getTypeConfig(type)
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.68rem] font-semibold"
      style={{ backgroundColor: `color-mix(in srgb, ${cfg.color} 16%, transparent)`, color: cfg.color }}
      title={`${cfg.label}${multiplier !== 0 ? ` ${formatMultiplier(multiplier)}` : ''}`}
    >
      <span aria-hidden="true">{cfg.emoji}</span>
      {cfg.label}
      {multiplier !== 0 && (
        <span className="tabular rounded bg-black/10 px-1 text-[0.6rem] dark:bg-white/15">
          {formatMultiplier(multiplier)}
        </span>
      )}
    </span>
  )
}

function AbilitiesCell({ pokemon, align }: { pokemon: Pokemon; align: 'left' | 'right' }) {
  return (
    <div className="flex flex-col gap-1.5">
      {pokemon.abilities.map((a) => (
        <span
          key={a.ability.name}
          className={`flex items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink ${
            align === 'right' ? 'flex-row-reverse text-right' : ''
          }`}
        >
          <span className="min-w-0 flex-1 truncate">{formatName(a.ability.name)}</span>
          {a.is_hidden && (
            <span className="shrink-0 rounded bg-amber-400/20 px-1 text-[0.6rem] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              Hidden
            </span>
          )}
        </span>
      ))}
    </div>
  )
}

function TypeChip({ type }: { type: string }) {
  const cfg = getTypeConfig(type)
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-white ring-1 ring-white/30"
      style={{ background: `linear-gradient(160deg, ${cfg.from}, ${cfg.to})` }}
    >
      <span aria-hidden="true">{cfg.emoji}</span>
      {cfg.label}
    </span>
  )
}
