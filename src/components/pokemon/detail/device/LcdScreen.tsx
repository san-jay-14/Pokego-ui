import type { ReactNode } from 'react'

interface LcdScreenProps {
  children: ReactNode
  className?: string
  /** Extra style hook (used for the rarity glow on the featured screen). */
  style?: React.CSSProperties
}

/**
 * A Pokédex "readout" — the signature green dot-matrix LCD panel.
 * Scanlines + pixel font come from the `.lcd` class in index.css.
 */
export function LcdScreen({ children, className = '', style }: LcdScreenProps) {
  return (
    <div className={`lcd rounded-lg ${className}`} style={style}>
      {children}
    </div>
  )
}
