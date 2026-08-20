import { useEffect, useRef, useState } from 'react'

/**
 * Observe when an element first enters the viewport. Once seen it stays `true`,
 * so it can gate expensive one-shot work (e.g. a card's enrichment fetches)
 * without re-triggering on scroll. Falls back to `true` when IntersectionObserver
 * is unavailable so nothing silently never-loads.
 */
export function useInView<T extends Element = HTMLDivElement>(
  rootMargin = '300px',
): { ref: React.RefObject<T | null>; inView: boolean } {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  return { ref, inView }
}
