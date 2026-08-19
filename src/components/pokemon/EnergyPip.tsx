import { getTypeConfig } from '@/constants/pokemonTypes'

interface EnergyPipProps {
  /** A Pokémon type slug, or 'colorless' for the neutral energy. */
  type: string
  size?: number
}

/**
 * A single TCG energy symbol — a glossy coloured "coin" with the type glyph,
 * used for HP type, attack costs and retreat cost.
 */
export function EnergyPip({ type, size = 16 }: EnergyPipProps) {
  if (type === 'colorless') {
    return (
      <span
        className="inline-grid shrink-0 place-items-center rounded-full text-[0.55em] font-bold"
        style={{
          width: size,
          height: size,
          background: 'radial-gradient(circle at 35% 30%, #fff, #d8dae2 70%, #b9bcc7)',
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.9)',
          color: '#8a8f9c',
        }}
        aria-hidden="true"
      >
        ✦
      </span>
    )
  }

  const cfg = getTypeConfig(type)
  return (
    <span
      className="inline-grid shrink-0 place-items-center rounded-full leading-none"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.56,
        background: `radial-gradient(circle at 34% 28%, color-mix(in srgb, ${cfg.from} 70%, #fff), ${cfg.color} 62%, ${cfg.to})`,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.35), inset 0 -1px 2px rgba(0,0,0,0.25), 0 1px 1px rgba(0,0,0,0.15)',
      }}
      aria-hidden="true"
    >
      <span style={{ filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.2))' }}>{cfg.emoji}</span>
    </span>
  )
}
