interface PokeballSpinnerProps {
  size?: number
  className?: string
}

/** A tiny spinning Pokéball used as the app's inline loading indicator. */
export function PokeballSpinner({ size = 20, className = '' }: PokeballSpinnerProps) {
  return (
    <span
      className={`inline-block ${className}`}
      style={{ width: size, height: size, animation: 'spin-slow 0.9s linear infinite' }}
      role="status"
      aria-label="Loading"
    >
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="7" opacity="0.25" />
        <path d="M50 4a46 46 0 0 1 46 46H73a23 23 0 0 0-46 0H4A46 46 0 0 1 50 4Z" fill="currentColor" />
        <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="7" />
      </svg>
    </span>
  )
}
