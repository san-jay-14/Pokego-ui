import { Star } from 'lucide-react'
import { getTypeConfig } from '@/constants/pokemonTypes'

interface EnergyPipProps {
  /** A Pokémon type slug, or 'colorless' for the neutral energy. */
  type: string
  size?: number
}

/**
 * A single TCG energy symbol — a glossy coloured "coin" carrying the type's
 * Lucide glyph, used for HP type, attack costs and retreat cost.
 */
export function EnergyPip({ type, size = 16 }: EnergyPipProps) {
  const glyph = Math.round(size * 0.62)

  if (type === 'colorless') {
    return (
      <span
        className="inline-grid shrink-0 place-items-center rounded-full"
        style={{
          width: size,
          height: size,
          background: 'radial-gradient(circle at 35% 30%, #fff, #d8dae2 70%, #b9bcc7)',
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.9)',
          color: '#8a8f9c',
        }}
        aria-hidden="true"
      >
        <Star size={glyph} fill="currentColor" strokeWidth={0} />
      </span>
    )
  }

  const cfg = getTypeConfig(type)
  const Icon = cfg.Icon
  return (
    <span
      className="inline-grid shrink-0 place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 34% 28%, color-mix(in srgb, ${cfg.from} 70%, #fff), ${cfg.color} 62%, ${cfg.to})`,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.35), inset 0 -1px 2px rgba(0,0,0,0.25), 0 1px 1px rgba(0,0,0,0.15)',
        color: cfg.onColor,
      }}
      aria-hidden="true"
    >
      <Icon
        size={glyph}
        strokeWidth={2.4}
        style={{ filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.25))' }}
      />
    </span>
  )
}
