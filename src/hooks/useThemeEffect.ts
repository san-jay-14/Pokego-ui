import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

/**
 * Reflects the persisted theme onto <html> so the `.dark` variant + the
 * browser chrome colour stay in sync. Mounted once, near the app root.
 */
export function useThemeEffect() {
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#0b0d12' : '#eef1f7')
  }, [theme])
}
