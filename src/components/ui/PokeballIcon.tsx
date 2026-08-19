interface PokeballIconProps {
  size?: number
  className?: string
}

/** The classic red-and-white Pokéball mark used as the app's brand glyph. */
export function PokeballIcon({ size = 40, className = '' }: PokeballIconProps) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#1a1a1a" strokeWidth="3" />
      <path d="M4 50a46 46 0 0 1 92 0Z" fill="#e6393f" />
      <rect x="4" y="46" width="92" height="7" fill="#1a1a1a" />
      <circle cx="50" cy="50" r="14" fill="#1a1a1a" />
      <circle cx="50" cy="50" r="8.5" fill="#ffffff" />
    </svg>
  )
}
