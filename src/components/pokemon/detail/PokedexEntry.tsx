import { BookOpen } from 'lucide-react'
import type { PokemonSpecies } from '@/types/pokemon'
import { getFlavorText } from '@/utils/species'

/** The Pokédex flavor entry, styled as a highlighted quote. */
export function PokedexEntry({ species }: { species: PokemonSpecies | undefined }) {
  if (!species) {
    return (
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton mt-2 h-4 w-2/3 rounded" />
      </div>
    )
  }
  const text = getFlavorText(species)
  if (!text) return null

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
      <BookOpen className="absolute -right-3 -top-3 h-20 w-20 text-primary/5" strokeWidth={1.5} />
      <p className="relative text-lg font-medium leading-relaxed text-ink-soft">
        <span className="mr-1 font-display text-primary">“</span>
        {text}
        <span className="ml-0.5 font-display text-primary">”</span>
      </p>
    </div>
  )
}
