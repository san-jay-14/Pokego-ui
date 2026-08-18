import { Moon, Sun } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

/** Light/dark switch. Persisted via the store; icon reflects the next state. */
export function ThemeToggle() {
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="grid h-11 w-11 place-items-center rounded-full border border-border bg-surface text-ink shadow-[var(--shadow-sm)] transition-all duration-200 hover:border-border-strong active:scale-90"
    >
      <span className="relative h-5 w-5">
        <Sun
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
            isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
          strokeWidth={2.2}
        />
        <Moon
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`}
          strokeWidth={2.2}
        />
      </span>
    </button>
  )
}
