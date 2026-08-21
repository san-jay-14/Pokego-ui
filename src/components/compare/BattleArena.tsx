import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Crown, Replace, Sparkles, Star, type LucideIcon } from 'lucide-react'
import type { Pokemon, PokemonTypeName } from '@/types/pokemon'
import { getTypeConfig } from '@/constants/pokemonTypes'
import { getTypeBackground } from '@/constants/typeBackgrounds'
import { useEvolutionChain, usePokemonSpecies, useTypeEffectiveness } from '@/hooks/usePokemonData'
import { getClassification, type Classification } from '@/utils/species'
import {
  MAX_STAT,
  STAT_META,
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
import { PokeballIcon } from '@/components/ui/PokeballIcon'

/** Where the diagonal seam crosses the hero — x% at the top and bottom edges. */
export const SEAM_TOP = 57
export const SEAM_BOTTOM = 43

interface BattleArenaProps {
  a: Pokemon
  b: Pokemon
  /** Drops a fighter so a replacement can be picked. */
  onRemove: (id: number) => void
}

/**
 * The full head-to-head, styled like the app's trading cards: a diagonally
 * split full-art hero tinted by each fighter's type, ghost dex numerals, then
 * black-glass panels for stats, attributes, matchups and abilities.
 */
export function BattleArena({ a, b, onRemove }: BattleArenaProps) {
  const cfgA = getTypeConfig(primaryType(a))
  const cfgB = getTypeConfig(primaryType(b))
  const effA = useTypeEffectiveness(a.types.map((t) => t.type.name))
  const effB = useTypeEffectiveness(b.types.map((t) => t.type.name))

  const totalA = totalStats(a)
  const totalB = totalStats(b)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      {/* Full-art diagonal split hero */}
      <div className="relative isolate overflow-hidden rounded-[var(--radius-card)] border border-white/10 shadow-[var(--shadow-lg)]">
        <ClippedSide
          clip={`polygon(0 0, ${SEAM_TOP}% 0, ${SEAM_BOTTOM}% 100%, 0 100%)`}
          cfg={cfgA}
          scene={getTypeBackground(primaryType(a))}
          deg={135}
        />
        <ClippedSide
          clip={`polygon(${SEAM_TOP}% 0, 100% 0, 100% 100%, ${SEAM_BOTTOM}% 100%)`}
          cfg={cfgB}
          scene={getTypeBackground(primaryType(b))}
          deg={225}
        />
        <div
          className="battle-seam absolute inset-0"
          style={{
            clipPath: `polygon(${SEAM_TOP}% 0, ${SEAM_TOP + 2.5}% 0, ${SEAM_BOTTOM + 2.5}% 100%, ${SEAM_BOTTOM}% 100%)`,
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 grid grid-cols-2">
          <Fighter pokemon={a} side="a" onReplace={onRemove} />
          <Fighter pokemon={b} side="b" onReplace={onRemove} />
        </div>

        {/* Bare pokéball on the seam */}
        <span className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <PokeballIcon
            size={96}
            className="h-16 w-16 drop-shadow-[0_6px_14px_rgba(0,0,0,0.7)] sm:h-24 sm:w-24"
          />
        </span>
      </div>

      {/* Base stats */}
      <GlassPanel title="Base stats">
        <div className="mx-auto flex w-full max-w-md flex-col gap-2">
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
          <div className="mt-2 flex items-center justify-center gap-4 border-t border-border pt-3">
            <TotalEnd value={totalA} win={totalA > totalB} color={cfgA.color} align="left" />
            <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-muted">Total</span>
            <TotalEnd value={totalB} win={totalB > totalA} color={cfgB.color} align="right" />
          </div>
        </div>
      </GlassPanel>

      {/* Attributes */}
      <GlassPanel title="Attributes">
        <div className="mx-auto flex w-full max-w-sm flex-col divide-y divide-border">
          <AttrRow label="Height" a={a.height} b={b.height} format={formatHeight} />
          <AttrRow label="Weight" a={a.weight} b={b.weight} format={formatWeight} />
          <AttrRow label="Base EXP" a={a.base_experience} b={b.base_experience} format={String} />
        </div>
      </GlassPanel>

      {/* Type matchups */}
      <GlassPanel title="Type matchups">
        <MirroredColumns
          left={<MatchupCell eff={effA.data} loading={effA.isLoading} align="right" />}
          right={<MatchupCell eff={effB.data} loading={effB.isLoading} align="left" />}
        />
      </GlassPanel>

      {/* Abilities */}
      <GlassPanel title="Abilities">
        <MirroredColumns
          left={<AbilitiesCell pokemon={a} align="right" />}
          right={<AbilitiesCell pokemon={b} align="left" />}
        />
      </GlassPanel>
    </div>
  )
}

/**
 * One clipped half of the hero: type-scene art + gradient tint + glow + vignette.
 * With no `cfg` (an empty battle slot) it falls back to a neutral dark facet so
 * the empty state shares the arena's exact frame.
 */
export function ClippedSide({
  clip,
  cfg,
  scene,
  deg,
}: {
  clip: string
  cfg: ReturnType<typeof getTypeConfig> | null
  scene: string | null
  deg: number
}) {
  return (
    <div className="absolute inset-0" style={{ clipPath: clip }} aria-hidden="true">
      {cfg && scene && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${scene}')` }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: cfg
            ? `linear-gradient(${deg}deg, color-mix(in srgb, ${cfg.from} 80%, transparent), color-mix(in srgb, ${cfg.to} 94%, transparent))`
            : `linear-gradient(${deg}deg, var(--surface-2), var(--surface-inset))`,
        }}
      />
      {cfg && (
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(circle at 50% 38%, ${cfg.glow}, transparent 62%)` }}
        />
      )}
      {cfg && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.62) 2%, rgba(0,0,0,0.08) 46%, transparent 72%)',
          }}
        />
      )}
    </div>
  )
}

export function Fighter({
  pokemon,
  side,
  onReplace,
}: {
  pokemon: Pokemon
  side: 'a' | 'b'
  onReplace: (id: number) => void
}) {
  const isB = side === 'b'
  const animated = hasAnimatedSprite(pokemon)

  // Rarity / evolution stage for the banner badge and legendary/mythical FX.
  const species = usePokemonSpecies(pokemon.id)
  const evolution = useEvolutionChain(species.data?.evolution_chain.url)
  const classification = getClassification(species.data, evolution.data, pokemon.name)
  const tone = classification?.tone ?? 'neutral'
  const showFx = tone === 'legendary' || tone === 'mythical'

  return (
    <div
      className={`relative flex min-h-[290px] flex-col px-2 pb-4 pt-4 sm:min-h-[360px] sm:pb-5 ${
        isB ? 'pl-5 sm:pl-10' : 'pr-5 sm:pr-10'
      }`}
    >
      {/* Ghost dex numeral + pokéball watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <PokeballIcon size={240} className="absolute h-48 w-48 opacity-[0.07] sm:h-64 sm:w-64" />
        <span className="font-display text-[5rem] font-black leading-none text-white/[0.14] sm:text-[8rem]">
          {String(pokemon.id).padStart(3, '0')}
        </span>
      </div>

      {/* Legendary / mythical aura + sparkles, behind the sprite */}
      {showFx && <RarityFx tone={tone as 'legendary' | 'mythical'} />}

      {/* Sprite */}
      <div className="relative z-10 flex flex-1 items-center justify-center">
        <img
          src={getAnimatedSprite(pokemon)}
          alt={formatName(pokemon.name)}
          className="battle-sprite h-32 w-32 object-contain sm:h-44 sm:w-44"
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
      </div>

      {/* Identity */}
      <div className="relative z-10 mt-2 flex flex-col items-center gap-1.5">
        {classification && <RarityBadge classification={classification} />}
        <Link
          to={`/pokemon/${pokemon.name}`}
          className="text-base font-black uppercase tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] hover:underline sm:text-xl"
          style={nameGlow(tone)}
        >
          {formatName(pokemon.name)}
        </Link>
        <div className="flex flex-wrap justify-center gap-1">
          {pokemon.types.map((t) => (
            <TypeChip key={t.type.name} type={t.type.name} />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onReplace(pokemon.id)}
        aria-label={`Replace ${formatName(pokemon.name)}`}
        title="Replace"
        className={`absolute top-2 z-20 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/45 text-white opacity-80 backdrop-blur-sm transition-all hover:bg-black/70 hover:opacity-100 active:scale-90 ${
          isB ? 'right-2' : 'left-2'
        }`}
      >
        <Replace className="h-4 w-4" strokeWidth={2.4} />
      </button>
    </div>
  )
}

/** Positions for the twinkling sparkles around a legendary / mythical sprite. */
const SPARK_POSITIONS = [
  { left: '22%', top: '28%', delay: '0s' },
  { left: '74%', top: '24%', delay: '0.5s' },
  { left: '32%', top: '60%', delay: '1s' },
  { left: '68%', top: '56%', delay: '0.3s' },
  { left: '50%', top: '18%', delay: '0.8s' },
  { left: '46%', top: '72%', delay: '1.3s' },
]

/** Pulsing aura + drifting sparkles rendered behind a rare fighter's sprite. */
function RarityFx({ tone }: { tone: 'legendary' | 'mythical' }) {
  return (
    <div
      className={`rarity-fx pointer-events-none absolute inset-0 z-0 ${
        tone === 'legendary' ? 'legendary-fx' : 'mythical-fx'
      }`}
      aria-hidden="true"
    >
      {SPARK_POSITIONS.map((p, i) => (
        <span key={i} className="rarity-spark" style={{ left: p.left, top: p.top, animationDelay: p.delay }} />
      ))}
    </div>
  )
}

/** Name glow that matches the rarity aura (gold / prismatic), plain otherwise. */
function nameGlow(tone: Classification['tone']): CSSProperties | undefined {
  if (tone === 'legendary') {
    return { color: '#ffe08a', textShadow: '0 0 12px rgba(255,200,80,0.7), 0 2px 4px rgba(0,0,0,0.8)' }
  }
  if (tone === 'mythical') {
    return { color: '#ffd7f4', textShadow: '0 0 12px rgba(210,130,255,0.75), 0 2px 4px rgba(0,0,0,0.8)' }
  }
  return undefined
}

/** The banner rarity / stage chip (Legendary, Mythical, Baby, or Basic/Stage 1/2). */
function RarityBadge({ classification }: { classification: Classification }) {
  const { tone, label } = classification
  if (tone === 'legendary') {
    return (
      <RarityChip Icon={Crown} label={label} style={{ background: 'linear-gradient(135deg,#ffe9a8,#e0a416)', color: '#4a3400' }} />
    )
  }
  if (tone === 'mythical') {
    return (
      <RarityChip Icon={Star} label={label} className="tcg-rainbow-foil" style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.55)' }} />
    )
  }
  if (tone === 'baby') {
    return (
      <RarityChip Icon={Sparkles} label={label} style={{ background: 'linear-gradient(135deg,#8fe0d6,#2f9c8f)', color: '#053033' }} />
    )
  }
  return <RarityChip label={label} style={{ background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.92)' }} />
}

function RarityChip({
  Icon,
  label,
  className = '',
  style,
}: {
  Icon?: LucideIcon
  label: string
  className?: string
  style?: CSSProperties
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.62rem] font-black uppercase tracking-wide shadow-[0_1px_3px_rgba(0,0,0,0.45)] ring-1 ring-white/25 ${className}`}
      style={style}
    >
      {Icon && <Icon className="h-3 w-3 shrink-0" strokeWidth={2.6} />}
      {label}
    </span>
  )
}

/** Glass section container so content stays legible over the arena bg — flips with theme. */
function GlassPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[var(--radius-card)] border border-border bg-surface/80 p-4 shadow-[var(--shadow-lg)] backdrop-blur-md sm:p-5">
      <h3 className="mb-3 text-center text-[0.68rem] font-bold uppercase tracking-[0.22em] text-muted">
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
    <div className="grid grid-cols-[1.75rem_1fr_2.75rem_1fr_1.75rem] items-center gap-1.5 sm:gap-2">
      <span
        className={`tabular text-right ${winA ? 'text-sm font-black text-ink' : 'text-xs font-bold text-muted'}`}
      >
        {va}
      </span>
      <span className="relative h-2 overflow-hidden rounded-full bg-surface-inset">
        <span
          className="absolute right-0 top-0 h-full rounded-full transition-[width] duration-500"
          style={{
            width: `${Math.min(100, (va / MAX_STAT) * 100)}%`,
            background: colorA,
            opacity: winA ? 1 : 0.4,
            boxShadow: winA ? `0 0 8px ${colorA}` : 'none',
          }}
        />
      </span>
      <span className="text-center text-[0.6rem] font-bold uppercase tracking-wide text-muted">
        {label}
      </span>
      <span className="relative h-2 overflow-hidden rounded-full bg-surface-inset">
        <span
          className="absolute left-0 top-0 h-full rounded-full transition-[width] duration-500"
          style={{
            width: `${Math.min(100, (vb / MAX_STAT) * 100)}%`,
            background: colorB,
            opacity: winB ? 1 : 0.4,
            boxShadow: winB ? `0 0 8px ${colorB}` : 'none',
          }}
        />
      </span>
      <span
        className={`tabular text-left ${winB ? 'text-sm font-black text-ink' : 'text-xs font-bold text-muted'}`}
      >
        {vb}
      </span>
    </div>
  )
}

function TotalEnd({
  value,
  win,
  color,
  align,
}: {
  value: number
  win: boolean
  color: string
  align: 'left' | 'right'
}) {
  return (
    <span
      className={`tabular flex items-center gap-1.5 ${align === 'right' ? 'flex-row-reverse' : ''} ${
        win ? 'text-2xl font-black' : 'text-lg font-bold text-muted'
      }`}
      style={win ? { color, textShadow: `0 0 12px color-mix(in srgb, ${color} 60%, transparent)` } : undefined}
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
      <span className="w-20 text-center text-[0.6rem] font-bold uppercase tracking-wide text-muted">
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
  if (value == null) return <span className={`text-sm text-muted ${cls}`}>—</span>
  const bigger = opponent == null || value > opponent
  return (
    <span
      className={`tabular ${cls} ${bigger ? 'text-base font-black text-ink' : 'text-sm font-bold text-muted'}`}
    >
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
            <div className="h-2.5 w-16 rounded bg-surface-inset" />
            <div className="h-6 w-full rounded-lg bg-surface-inset" />
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
      <p className={`mb-1 text-[0.62rem] font-bold uppercase tracking-wide ${toneClass}`}>{label}</p>
      {items.length === 0 ? (
        <p className="text-xs text-muted">None</p>
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
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.68rem] font-semibold text-ink"
      style={{ backgroundColor: `color-mix(in srgb, ${cfg.color} 32%, transparent)` }}
      title={`${cfg.label}${multiplier !== 0 ? ` ${formatMultiplier(multiplier)}` : ''}`}
    >
      <cfg.Icon className="h-3 w-3 shrink-0" strokeWidth={2.4} aria-hidden="true" />
      {cfg.label}
      {multiplier !== 0 && (
        <span className="tabular rounded bg-black/15 px-1 text-[0.6rem] dark:bg-black/30">
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
          className={`flex items-center gap-1.5 rounded-lg bg-surface-inset px-2.5 py-1 text-xs font-semibold text-ink ${
            align === 'right' ? 'flex-row-reverse text-right' : ''
          }`}
        >
          <span className="min-w-0 flex-1 truncate">{formatName(a.ability.name)}</span>
          {a.is_hidden && (
            <span className="shrink-0 rounded bg-amber-400/25 px-1 text-[0.58rem] font-bold uppercase tracking-wide text-amber-300">
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
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-white shadow-[0_1px_3px_rgba(0,0,0,0.4)] ring-1 ring-white/30"
      style={{ background: `linear-gradient(160deg, ${cfg.from}, ${cfg.to})` }}
    >
      <cfg.Icon className="h-3 w-3 shrink-0" strokeWidth={2.4} aria-hidden="true" />
      {cfg.label}
    </span>
  )
}
