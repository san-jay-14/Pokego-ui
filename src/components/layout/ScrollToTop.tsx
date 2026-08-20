import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const isModal = (path: string) => path.startsWith('/pokemon/')

/**
 * Scrolls to the top on genuine page changes. Opening or closing the Pokédex
 * modal overlays Home in place, so those transitions are skipped — the grid
 * keeps its scroll position underneath the (scroll-locked) device.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()
  const prev = useRef(pathname)

  useEffect(() => {
    if (!isModal(pathname) && !isModal(prev.current)) {
      window.scrollTo({ top: 0 })
    }
    prev.current = pathname
  }, [pathname])

  return null
}
