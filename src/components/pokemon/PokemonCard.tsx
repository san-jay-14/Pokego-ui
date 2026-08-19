import { memo } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Scale } from 'lucide-react'
import type { Pokemon } from '@/types/pokemon'
import { getTypeConfig } from '@/constants/pokemonTypes'
import { getTypeBackground } from '@/constants/typeBackgrounds'
import {
  formatDexId,
  formatHeightImperial,
  formatName,
  formatWeightImperial,
  getArtwork,
  getStat,
  primaryType,
} from '@/utils/pokemon'
import { deriveAttacks, retreatCost, weaknessFor } from '@/utils/tcg'
import { EnergyPip } from './EnergyPip'
import { useAppStore } from '@/store/useAppStore'
import { useHoloPointer } from '@/hooks/useHoloPointer'

interface PokemonCardProps {
  pokemon: Pokemon
  index?: number
}

const BORDER = '#0c0c0f' // outer card border — black for now
const INK = '#ffffff'
const MUTED = 'rgba(255,255,255,0.72)'
const LINE = 'rgba(255,255,255,0.18)'
const GLASS = 'rgba(10,12,18,0.42)'

/**
 * Full-art card variant: the type scene fills the whole card, the Pokémon is
 * composited on top, and every text zone lives in a translucent glass panel
 * (frosted, so white text stays legible over any artwork).
 */
export const PokemonCard = memo(function PokemonCard({ pokemon, index = 0 }: PokemonCardProps) {
  const primary = primaryType(pokemon)
  const cfg = getTypeConfig(primary)
  const scene = getTypeBackground(primary)
  const hp = getStat(pokemon, 'hp')
  const attacks = deriveAttacks(pokemon)
  const weak = weaknessFor(primary)
  const retreat = retreatCost(pokemon.weight)
  const holo = useHoloPointer()

  const isFavorite = useAppStore((s) => s.favorites.includes(pokemon.id))
  const toggleFavorite = useAppStore((s) => s.toggleFavorite)
  const isComparing = useAppStore((s) => s.compare.includes(pokemon.id))
  const toggleCompare = useAppStore((s) => s.toggleCompare)

  return (
    <div
      className="group/card animate-pop-in relative [perspective:1000px]"
      style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
    >
      <Link
        to={`/pokemon/${pokemon.name}`}
        aria-label={`${formatName(pokemon.name)}, ${formatDexId(pokemon.id)}, ${cfg.label} type, ${hp} HP`}
        onPointerMove={holo.onPointerMove}
        onPointerLeave={holo.onPointerLeave}
        style={{ ...holo.style, '--type': cfg.color } as CSSProperties}
        className="tcg-card @container relative block aspect-[63/88] overflow-hidden rounded-[6%] shadow-[var(--shadow-md)] transition-shadow duration-300 hover:shadow-[var(--shadow-pop)] focus-visible:shadow-[var(--shadow-pop)]"
      >
        {/* Outer border (black) */}
        <div className="absolute inset-0" style={{ background: BORDER }} />

        {/* Full-art body */}
        <div
          className="absolute inset-[3.5%] overflow-hidden rounded-[5%]"
          style={{ fontFamily: 'var(--font-card)', color: INK }}
        >
          {/* Scene / type background, full bleed */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: scene
                ? `url("${scene}")`
                : `linear-gradient(158deg, ${cfg.from}, ${cfg.to})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          {/* Depth wash for legibility (top + bottom) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.28), transparent 22%, transparent 52%, rgba(0,0,0,0.4))',
            }}
          />

          {/* Pokémon composited on the scene */}
          <img
            src={getArtwork(pokemon)}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = '/pokeball.svg'
              e.currentTarget.classList.add('opacity-40')
            }}
            className="absolute inset-x-0 top-[10%] z-10 mx-auto h-[56%] w-[86%] object-contain transition-transform duration-300 ease-[var(--ease-smooth)]"
            style={{
              transform: `scale(${holo.active ? 1.06 : 1})`,
              filter: 'drop-shadow(0 10px 12px rgba(0,0,0,0.45))',
            }}
          />

          {/* Content — glass panels */}
          <div className="relative z-20 flex h-full flex-col p-[5%]">
            {/* Header */}
            <div
              className="flex items-center justify-between gap-1.5 rounded-[10px] border px-2.5 py-[6px]"
              style={{ background: GLASS, borderColor: LINE, backdropFilter: 'blur(6px)' }}
            >
              <h3 className="min-w-0 flex-1 truncate font-bold leading-none" style={{ fontSize: 'clamp(11px, 6.4cqw, 18px)' }}>
                {formatName(pokemon.name)}
              </h3>
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="flex items-baseline gap-[2px] font-bold leading-none">
                  <span style={{ color: MUTED, fontSize: 'clamp(5px, 2.6cqw, 8px)' }}>HP</span>
                  <span style={{ fontSize: 'clamp(12px, 6.8cqw, 19px)' }}>{hp}</span>
                </span>
                <TypeChip type={primary} />
              </div>
            </div>

            <div className="flex-1" />

            {/* Bottom info panel */}
            <div
              className="rounded-[10px] border px-2.5 py-2"
              style={{ background: GLASS, borderColor: LINE, backdropFilter: 'blur(6px)' }}
            >
              {/* Pokédex info bar */}
              <div className="flex items-center gap-1.5">
                <span className="tabular shrink-0 font-bold" style={{ fontSize: 'clamp(6px, 2.9cqw, 9px)' }}>
                  NO. {String(pokemon.id).padStart(3, '0')}
                </span>
                <span className="truncate font-semibold" style={{ fontSize: 'clamp(6px, 2.9cqw, 9px)' }}>
                  {cfg.label} Pokémon
                </span>
                <span
                  className="tabular ml-auto hidden shrink-0 whitespace-nowrap @[150px]:block"
                  style={{ color: MUTED, fontSize: 'clamp(6px, 2.7cqw, 9px)' }}
                >
                  HT: {formatHeightImperial(pokemon.height)} · WT: {formatWeightImperial(pokemon.weight)}
                </span>
              </div>

              <div className="my-[5px] h-px" style={{ background: LINE }} />

              {/* Attacks */}
              <div className="flex flex-col gap-[3px]">
                <AttackRow attack={attacks[0]} />
                {attacks[1] && (
                  <div className="hidden @[210px]:block">
                    <AttackRow attack={attacks[1]} />
                  </div>
                )}
              </div>

              <div className="my-[5px] h-px" style={{ background: LINE }} />

              {/* Weakness / Resistance / Retreat */}
              <div className="grid grid-cols-3 gap-1">
                <FooterCell label="Weakness">
                  <EnergyPip type={weak} size={12} />
                  <span className="tabular font-bold" style={{ fontSize: 'clamp(6px, 3cqw, 9px)' }}>
                    ×2
                  </span>
                </FooterCell>
                <FooterCell label="Resistance" borderColor={LINE}>
                  <span style={{ color: MUTED, fontSize: 'clamp(7px, 3.4cqw, 11px)' }}>—</span>
                </FooterCell>
                <FooterCell label="Retreat">
                  {Array.from({ length: retreat }).map((_, i) => (
                    <EnergyPip key={i} type="colorless" size={11} />
                  ))}
                </FooterCell>
              </div>
            </div>
          </div>
        </div>

        {/* Pointer glare across the whole card */}
        <div className="tcg-glare" style={{ opacity: holo.active ? 0.6 : 0 }} />
      </Link>

      {/* Floating controls */}
      <div className="absolute right-[6%] top-[5.5%] z-30 flex gap-1 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover/card:opacity-100">
        <CornerButton
          active={isFavorite}
          activeClass="bg-danger text-white"
          label={isFavorite ? `Remove ${pokemon.name} from favourites` : `Add ${pokemon.name} to favourites`}
          onClick={() => toggleFavorite(pokemon.id)}
        >
          <Heart className="h-[15px] w-[15px]" fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2.4} />
        </CornerButton>
        <CornerButton
          active={isComparing}
          activeClass="bg-primary text-primary-ink"
          label={isComparing ? `Remove ${pokemon.name} from compare` : `Add ${pokemon.name} to compare`}
          onClick={() => toggleCompare(pokemon.id)}
        >
          <Scale className="h-[15px] w-[15px]" strokeWidth={2.4} />
        </CornerButton>
      </div>
    </div>
  )
})

/** Header type badge — a white pill with the type glyph + label in type colour. */
function TypeChip({ type }: { type: string }) {
  const cfg = getTypeConfig(type)
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full py-[2px] pl-[3px] pr-2 font-bold uppercase tracking-wide"
      style={{ background: 'rgba(255,255,255,0.92)', fontSize: 'clamp(6px, 2.7cqw, 9px)' }}
    >
      <EnergyPip type={type} size={14} />
      <span className="hidden @[168px]:inline" style={{ color: cfg.color }}>
        {cfg.label}
      </span>
    </span>
  )
}

function AttackRow({ attack }: { attack: ReturnType<typeof deriveAttacks>[number] }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex shrink-0 items-center gap-[2px]">
        {attack.cost.map((c, i) => (
          <EnergyPip key={i} type={c} size={13} />
        ))}
      </span>
      <span className="min-w-0 flex-1 truncate font-bold" style={{ fontSize: 'clamp(9px, 4.4cqw, 13px)' }}>
        {attack.name}
      </span>
      <span className="tabular shrink-0 font-bold" style={{ fontSize: 'clamp(10px, 5.2cqw, 16px)' }}>
        {attack.damage}
      </span>
    </div>
  )
}

function FooterCell({
  label,
  children,
  borderColor,
}: {
  label: string
  children: ReactNode
  borderColor?: string
}) {
  return (
    <div
      className={`flex flex-col items-center gap-[2px] ${borderColor ? 'border-x px-1' : ''}`}
      style={borderColor ? { borderColor } : undefined}
    >
      <span
        className="font-semibold uppercase leading-none tracking-wide"
        style={{ color: MUTED, fontSize: 'clamp(5px, 2.3cqw, 7px)' }}
      >
        {label}
      </span>
      <span className="flex items-center gap-[2px]">{children}</span>
    </div>
  )
}

function CornerButton({
  active,
  activeClass,
  label,
  onClick,
  children,
}: {
  active: boolean
  activeClass: string
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      aria-pressed={active}
      aria-label={label}
      className={`grid h-8 w-8 place-items-center rounded-full border border-white/20 shadow-md backdrop-blur-sm transition-all duration-200 active:scale-90 ${
        active ? activeClass : 'bg-black/50 text-white hover:bg-black/65'
      }`}
    >
      {children}
    </button>
  )
}
