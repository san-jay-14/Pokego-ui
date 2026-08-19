import { memo, useMemo } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Scale } from 'lucide-react'
import type { MoveDetail, Pokemon } from '@/types/pokemon'
import { getTypeConfig } from '@/constants/pokemonTypes'
import { getTypeBackground } from '@/constants/typeBackgrounds'
import { formatDexId, formatName, formatHeightImperial, formatWeightImperial, getArtwork, getStat, primaryType } from '@/utils/pokemon'
import { energyCostForPower, retreatCost, weaknessFor } from '@/utils/tcg'
import { getClassification, getGenus, type Classification } from '@/utils/species'
import { formatMultiplier } from '@/utils/typeEffectiveness'
import { idFromUrl } from '@/services/pokemonApi'
import {
  useEvolutionChain,
  useMoveDetails,
  usePokemonSpecies,
  useTypeEffectiveness,
} from '@/hooks/usePokemonData'
import { EnergyPip } from './EnergyPip'
import { useAppStore } from '@/store/useAppStore'
import { useHoloPointer } from '@/hooks/useHoloPointer'

interface PokemonCardProps {
  pokemon: Pokemon
  index?: number
}

const INK = '#ffffff'
const MUTED = 'rgba(255,255,255,0.75)'
const LINE = 'rgba(255,255,255,0.2)'
const GLASS = 'rgba(10,12,18,0.44)'
const SILVER = '#c2c6d2'
const SILVER_DARK = '#7c8191'

const GOLD_DARK = 'linear-gradient(135deg, #6b4a12 0%, #caa53d 25%, #ffe9a8 50%, #b8862a 75%, #4a3008 100%)'
const RAINBOW_FOIL = 'linear-gradient(120deg, #ff5f8f, #ffd166, #6ee7b7, #60a5fa, #c084fc, #ff5f8f)'
const BABY_FOIL = 'linear-gradient(135deg, #8fe0d6, #2f9c8f)'
const GOLD_INK = '#f5cf6b'

/**
 * Border-frame and stage-badge colour, driven by rarity — a darker glitter
 * gold for Legendary (with a sparkle texture on the frame), rainbow foil for
 * Mythical, teal for Baby, and the Pokémon's own type colour for ordinary
 * Basic/Stage cards.
 */
function getRarityTreatment(tone: Classification['tone'] | undefined, cfg: { from: string; to: string }) {
  if (tone === 'legendary') return { fill: GOLD_DARK, borderClass: 'tcg-gold-glitter' }
  if (tone === 'mythical') return { fill: RAINBOW_FOIL, borderClass: undefined }
  if (tone === 'baby') return { fill: BABY_FOIL, borderClass: undefined }
  return { fill: `linear-gradient(135deg, ${cfg.from}, ${cfg.to})`, borderClass: undefined }
}

/**
 * Full-art trading card built from live PokéAPI data: a classification tag
 * (Basic / Stage / Legendary…), genus, HP, real attack moves with their real
 * power, and the real type weakness — all fetched per card and cached.
 */
export const PokemonCard = memo(function PokemonCard({ pokemon, index = 0 }: PokemonCardProps) {
  const primary = primaryType(pokemon)
  const cfg = getTypeConfig(primary)
  const scene = getTypeBackground(primary)
  const hp = getStat(pokemon, 'hp')
  const retreat = retreatCost(pokemon.weight)
  const holo = useHoloPointer()

  // Live data for original stats + classification + genus.
  const species = usePokemonSpecies(pokemon.id)
  const evolution = useEvolutionChain(species.data?.evolution_chain.url)
  const typeNames = useMemo(() => pokemon.types.map((t) => t.type.name), [pokemon])
  const effectiveness = useTypeEffectiveness(typeNames)
  const attackNames = useMemo(() => pokemon.moves.slice(0, 2).map((m) => m.move.name), [pokemon])
  const moves = useMoveDetails(attackNames)

  const genus = species.data ? getGenus(species.data) : `${cfg.label} Pokémon`
  const classification = getClassification(species.data, evolution.data, pokemon.name)
  const preEvo = species.data?.evolves_from_species ?? null
  const preEvoSprite = preEvo
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${idFromUrl(preEvo.url)}.png`
    : null
  const rarity = getRarityTreatment(classification?.tone, cfg)
  const hasBorder = classification?.tone === 'legendary' || classification?.tone === 'mythical' || classification?.tone === 'baby'
  const topWeak = effectiveness.data?.weak[0]
  const weakType = topWeak?.type ?? weaknessFor(primary)
  const weakLabel = topWeak ? formatMultiplier(topWeak.multiplier) : '×2'

  const isFavorite = useAppStore((s) => s.favorites.includes(pokemon.id))
  const toggleFavorite = useAppStore((s) => s.toggleFavorite)
  const isComparing = useAppStore((s) => s.compare.includes(pokemon.id))
  const toggleCompare = useAppStore((s) => s.toggleCompare)

  const muted = MUTED

  return (
    <div
      className="group/card animate-pop-in relative [perspective:1200px]"
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
        {hasBorder && (
          <div
            className={`absolute inset-0 ${rarity.borderClass ?? ''}`}
            style={rarity.borderClass ? undefined : { backgroundImage: rarity.fill }}
          />
        )}

        {/* Full-art body — thin inset to reveal the rarity border, or edge-to-edge when there's no border */}
        <div
          className={`absolute overflow-hidden ${hasBorder ? 'inset-[1.4%] rounded-[5.5%]' : 'inset-0 rounded-[6%]'}`}
          style={{ fontFamily: 'var(--font-card)', color: INK }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: scene ? `url("${scene}")` : `linear-gradient(158deg, ${cfg.from}, ${cfg.to})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent 22%, transparent 52%, rgba(0,0,0,0.42))' }}
          />

          {/* Stage tag — flush to the card's true top-left corner, dipping into the name bar below it */}
          {classification && (
            <span
              className="absolute left-0 top-0 z-30 rounded-br-2xl border-b border-r px-3.5 py-[2px] uppercase leading-none"
              style={{
                backgroundImage: rarity.fill,
                borderColor: SILVER_DARK,
                color: '#ffffff',
                textShadow: '0 1px 2px rgba(0,0,0,0.45)',
                fontFamily: 'var(--font-stage)',
                fontSize: 'clamp(13px, 4.6cqw, 18px)',
                letterSpacing: '0.04em',
                boxShadow: '0 2px 5px rgba(0,0,0,0.35)',
              }}
            >
              {classification.label}
            </span>
          )}

          {/* Pokémon */}
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
            className="absolute inset-x-0 top-[16%] z-10 mx-auto h-[56%] w-[86%] object-contain transition-transform duration-300 ease-[var(--ease-smooth)]"
            style={{
              transform: `scale(${holo.active ? 1.17 : 1.12})`,
              transformOrigin: '50% 100%',
              filter: 'drop-shadow(0 10px 12px rgba(0,0,0,0.4))',
            }}
          />

          {/* Content */}
          <div className="relative z-20 flex h-full flex-col px-[5%] pb-[5%] pt-[3%]">
            {/* Name bar — name centered, HP + type icon on the right */}
            <div className="relative" style={{ marginBottom: preEvo ? 16 : 8 }}>
              <div
                className="flex items-center gap-1.5 rounded-full border px-3 py-[7px]"
                style={{ background: GLASS, borderColor: LINE, backdropFilter: 'blur(6px)' }}
              >
                <h3
                  className="min-w-0 flex-1 truncate text-center font-bold leading-none"
                  style={{
                    fontSize: 'clamp(13px, 5.8cqw, 21px)',
                    paddingLeft: 'clamp(10px, 5cqw, 22px)',
                    color: classification?.tone === 'legendary' ? GOLD_INK : undefined,
                    textShadow: classification?.tone === 'legendary' ? '0 1px 3px rgba(0,0,0,0.6)' : undefined,
                  }}
                >
                  {formatName(pokemon.name)}
                </h3>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="flex items-baseline gap-[2px] font-bold leading-none">
                    <span style={{ color: muted, fontSize: 'clamp(6px, 2.6cqw, 9px)' }}>HP</span>
                    <span style={{ fontSize: 'clamp(14px, 6.6cqw, 22px)' }}>{hp}</span>
                  </span>
                  <EnergyPip type={primary} size={24} />
                </div>
              </div>

              {/* Pre-evo badge + "evolves from" — hangs off the bar's bottom-left, pushed further out, no gap between them */}
              {preEvo && (
                <div
                  className="absolute top-full z-30 flex items-center"
                  style={{ transform: 'translateY(-28%)', left: 'clamp(-10px, -2.5cqw, -2px)' }}
                >
                  <span className="relative z-10">{preEvoSprite && <EvoBadge src={preEvoSprite} />}</span>
                  <span
                    className="relative z-0 -ml-3 whitespace-nowrap rounded-full border-2 py-1 pl-5 pr-3 italic leading-none"
                    style={{
                      background: 'rgba(255,255,255,0.95)',
                      borderColor: SILVER,
                      color: '#5a5f6b',
                      fontSize: 'clamp(8px, 3cqw, 12px)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                    }}
                  >
                    Evolves from {formatName(preEvo.name)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1" />

            {/* Info + attacks + footer */}
            <div className="rounded-[10px] border px-2.5 py-2.5" style={{ background: GLASS, borderColor: LINE, backdropFilter: 'blur(6px)' }}>
              {/* Genus / dex / HT-WT */}
              <div className="flex items-center gap-1.5">
                <span className="tabular shrink-0 font-bold" style={{ fontSize: 'clamp(7px, 2.9cqw, 11px)' }}>
                  NO. {String(pokemon.id).padStart(3, '0')}
                </span>
                <span className="min-w-0 flex-1 truncate text-center font-semibold" style={{ fontSize: 'clamp(7px, 2.9cqw, 11px)' }}>
                  {genus}
                </span>
                <span className="tabular hidden shrink-0 whitespace-nowrap @[150px]:block" style={{ color: muted, fontSize: 'clamp(7px, 2.7cqw, 10px)' }}>
                  {formatHeightImperial(pokemon.height)} · {formatWeightImperial(pokemon.weight)}
                </span>
              </div>

              <div className="my-[6px] h-px" style={{ background: LINE }} />

              {/* Attacks (real move type + power) */}
              <div className="flex flex-col gap-[5px]">
                <AttackRow name={attackNames[0]} detail={moves.byName.get(attackNames[0])} fallbackType={primary} />
                {attackNames[1] && (
                  <div className="hidden @[210px]:block">
                    <AttackRow name={attackNames[1]} detail={moves.byName.get(attackNames[1])} fallbackType={primary} />
                  </div>
                )}
              </div>

              <div className="my-[6px] h-px" style={{ background: LINE }} />

              {/* Weakness / Resistance / Retreat */}
              <div className="grid grid-cols-3 gap-1">
                <FooterCell label="Weakness" muted={muted}>
                  <EnergyPip type={weakType} size={13} />
                  <span className="tabular font-bold" style={{ fontSize: 'clamp(7px, 3cqw, 10px)' }}>
                    {weakLabel}
                  </span>
                </FooterCell>
                <FooterCell label="Resistance" muted={muted} borderColor={LINE}>
                  <span style={{ color: muted, fontSize: 'clamp(8px, 3.4cqw, 12px)' }}>—</span>
                </FooterCell>
                <FooterCell label="Retreat" muted={muted}>
                  {Array.from({ length: retreat }).map((_, i) => (
                    <EnergyPip key={i} type="colorless" size={12} />
                  ))}
                </FooterCell>
              </div>
            </div>
          </div>
        </div>

        <div className="tcg-glare" style={{ opacity: holo.active ? 0.7 : 0 }} />
      </Link>

      {/* Floating controls */}
      <div className="absolute right-[6%] top-[5.5%] z-30 flex gap-1 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover/card:opacity-100">
        <CornerButton
          active={isFavorite}
          activeClass="bg-danger text-white"
          label={isFavorite ? `Remove ${pokemon.name} from favourites` : `Add ${pokemon.name} to favourites`}
          onClick={() => toggleFavorite(pokemon.id)}
        >
          <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2.4} />
        </CornerButton>
        <CornerButton
          active={isComparing}
          activeClass="bg-primary text-primary-ink"
          label={isComparing ? `Remove ${pokemon.name} from compare` : `Add ${pokemon.name} to compare`}
          onClick={() => toggleCompare(pokemon.id)}
        >
          <Scale className="h-4 w-4" strokeWidth={2.4} />
        </CornerButton>
      </div>
    </div>
  )
})

/** Silver-ringed coin holding the pre-evolution's sprite, like the real cards. */
function EvoBadge({ src }: { src: string }) {
  return (
    <span
      className="grid shrink-0 place-items-center overflow-hidden rounded-full"
      style={{
        width: 'clamp(30px, 14cqw, 52px)',
        height: 'clamp(30px, 14cqw, 52px)',
        background: 'radial-gradient(circle at 40% 28%, #fefefe, #cfd4de 58%, #99a0ae)',
        boxShadow:
          'inset 0 0 0 2px rgba(255,255,255,0.7), inset 0 0 0 4px rgba(120,126,138,0.55), 0 2px 3px rgba(0,0,0,0.35)',
      }}
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
        className="h-[118%] w-[118%] object-cover"
        style={{ imageRendering: 'auto' }}
      />
    </span>
  )
}

function AttackRow({ name, detail, fallbackType }: { name: string; detail: MoveDetail | undefined; fallbackType: string }) {
  const cost = detail
    ? energyCostForPower(detail.power, detail.type.name)
    : [fallbackType]
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex shrink-0 items-center gap-[2px]">
        {cost.map((c, i) => (
          <EnergyPip key={i} type={c} size={14} />
        ))}
      </span>
      <span className="min-w-0 flex-1 truncate font-bold" style={{ fontSize: 'clamp(10px, 4.4cqw, 15px)' }}>
        {formatName(name)}
      </span>
      <span className="tabular shrink-0 font-bold" style={{ fontSize: 'clamp(12px, 5.2cqw, 18px)' }}>
        {detail ? detail.power ?? '—' : ''}
      </span>
    </div>
  )
}

function FooterCell({
  label,
  muted,
  children,
  borderColor,
}: {
  label: string
  muted: string
  children: ReactNode
  borderColor?: string
}) {
  return (
    <div
      className={`flex flex-col items-center gap-[3px] ${borderColor ? 'border-x px-1' : ''}`}
      style={borderColor ? { borderColor } : undefined}
    >
      <span className="font-semibold uppercase leading-none tracking-wide" style={{ color: muted, fontSize: 'clamp(6px, 2.4cqw, 9px)' }}>
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
      className={`grid h-9 w-9 place-items-center rounded-full border border-white/20 shadow-md backdrop-blur-sm transition-all duration-200 active:scale-90 ${
        active ? activeClass : 'bg-black/50 text-white hover:bg-black/65'
      }`}
    >
      {children}
    </button>
  )
}
