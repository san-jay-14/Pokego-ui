import { Link } from 'react-router-dom'
import { PageContainer } from './PageContainer'
import { ThemeToggle } from './ThemeToggle'

/** The app wordmark: a compact Pokéball glyph + "Pokédex / Field Index". */
function Brand() {
  return (
    <Link
      to="/"
      className="group flex items-center gap-2.5 rounded-xl"
      aria-label="Pokédex Field Index — home"
    >
      <span className="relative grid h-10 w-10 place-items-center">
        <svg viewBox="0 0 100 100" className="h-10 w-10 transition-transform duration-500 group-hover:rotate-[20deg]">
          <circle cx="50" cy="50" r="46" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="3" />
          <path d="M4 50a46 46 0 0 1 92 0Z" fill="var(--primary)" />
          <rect x="4" y="46" width="92" height="7" fill="var(--ink)" />
          <circle cx="50" cy="50" r="14" fill="var(--ink)" />
          <circle cx="50" cy="50" r="8.5" fill="var(--surface)" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-bold tracking-tight text-ink">Pokédex</span>
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">
          Field Index
        </span>
      </span>
    </Link>
  )
}

/** Sticky top navigation. Kept slim so it never eats the viewport. */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/80 backdrop-blur-xl">
      <PageContainer className="flex h-16 items-center justify-between gap-4">
        <Brand />
        <ThemeToggle />
      </PageContainer>
    </header>
  )
}
