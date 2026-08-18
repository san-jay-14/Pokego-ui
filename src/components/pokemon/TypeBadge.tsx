import { getTypeConfig } from '@/constants/pokemonTypes'

interface TypeBadgeProps {
  type: string
  size?: 'sm' | 'md'
  /** Solid = filled with the type colour; soft = tinted pill on surfaces. */
  variant?: 'solid' | 'soft'
}

/** A single Pokémon-type chip. Colour always resolves via the central config. */
export function TypeBadge({ type, size = 'sm', variant = 'solid' }: TypeBadgeProps) {
  const cfg = getTypeConfig(type)
  const dims =
    size === 'sm' ? 'text-[0.7rem] px-2.5 py-1 gap-1' : 'text-sm px-3.5 py-1.5 gap-1.5'

  const style =
    variant === 'solid'
      ? { backgroundColor: cfg.color, color: cfg.onColor }
      : {
          backgroundColor: `color-mix(in srgb, ${cfg.color} 16%, transparent)`,
          color: cfg.color,
        }

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold tracking-wide ${dims}`}
      style={style}
    >
      <span aria-hidden="true">{cfg.emoji}</span>
      <span className="capitalize">{cfg.label}</span>
    </span>
  )
}
