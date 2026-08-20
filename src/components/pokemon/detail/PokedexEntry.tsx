import { BookOpen, ScanLine } from 'lucide-react'
import type { PokemonSpecies } from '@/types/pokemon'
import { getFlavorText } from '@/utils/species'
import { LcdScreen } from './device/LcdScreen'

/** The Pokédex flavor entry, shown on the device's green "description" screen. */
export function PokedexEntry({ species }: { species: PokemonSpecies | undefined }) {
  if (!species) {
    return (
      <LcdScreen className="px-4 py-3">
        <div className="h-4 w-2/3 rounded bg-[#26340f]/15" />
        <div className="mt-2 h-4 w-1/2 rounded bg-[#26340f]/15" />
      </LcdScreen>
    )
  }
  const text = getFlavorText(species)
  if (!text) {
    return (
      <LcdScreen className="px-4 py-2 sm:px-5">
        <div
          className="mb-0.5 flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.2em] opacity-70"
          style={{ fontFamily: 'var(--font-lcd)' }}
        >
          <BookOpen className="h-3 w-3" />
          Dex Entry
        </div>
        <p
          className="flex items-center gap-1.5 text-base leading-snug opacity-70"
          style={{ fontFamily: 'var(--font-lcd)' }}
        >
          <ScanLine className="h-3.5 w-3.5 shrink-0" />
          No entry detected.
        </p>
      </LcdScreen>
    )
  }

  return (
    <LcdScreen className="px-4 py-2 sm:px-5">
      <div
        className="mb-0.5 flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.2em] opacity-70"
        style={{ fontFamily: 'var(--font-lcd)' }}
      >
        <BookOpen className="h-3 w-3" />
        Dex Entry
      </div>
      <p className="text-base leading-snug" style={{ fontFamily: 'var(--font-lcd)' }}>
        {text}
        <span className="lcd-cursor ml-0.5">▌</span>
      </p>
    </LcdScreen>
  )
}
