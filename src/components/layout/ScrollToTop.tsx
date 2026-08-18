import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Scrolls to the top on every route change (mounted once inside the router). */
export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}
