import { useCallback, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'

const MAX_TILT = 9 // degrees

interface HoloState {
  style: CSSProperties
  active: boolean
  onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void
  onPointerLeave: () => void
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/**
 * Pointer-tracked 3D tilt + holo glare for a card. Sets `--mx/--my` (glare
 * position) and a tilt transform while hovered. No-ops under reduced motion.
 */
export function useHoloPointer(): HoloState {
  const [active, setActive] = useState(false)
  const vars = useRef<CSSProperties>({})
  const [, force] = useState(0)
  const reduced = useRef(prefersReducedMotion())

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (reduced.current) return
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    vars.current = {
      '--mx': `${(px * 100).toFixed(1)}%`,
      '--my': `${(py * 100).toFixed(1)}%`,
      transform: `perspective(900px) rotateX(${((0.5 - py) * MAX_TILT).toFixed(2)}deg) rotateY(${((px - 0.5) * MAX_TILT).toFixed(2)}deg) scale(1.04)`,
    } as CSSProperties
    setActive(true)
    force((n) => n + 1)
  }, [])

  const onPointerLeave = useCallback(() => {
    vars.current = {}
    setActive(false)
  }, [])

  return { style: vars.current, active, onPointerMove, onPointerLeave }
}
