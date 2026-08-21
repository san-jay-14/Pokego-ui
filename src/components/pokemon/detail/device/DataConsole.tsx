import { useState } from 'react'
import type { AbilityDetail, Pokemon, PokemonSpecies } from '@/types/pokemon'
import { LcdScreen } from './LcdScreen'
import { DPad } from './DPad'
import { StatsFields } from './StatsFields'
import { AbilitiesFields, BreedingFields, ProfileFields } from './DataScreens'

interface DataConsoleProps {
  pokemon: Pokemon
  species: PokemonSpecies | undefined
  abilityDetails: Map<string, AbilityDetail>
}

const PAGES = ['Stats', 'Profile', 'Breeding', 'Abilities'] as const

/**
 * Metal-framed console: D-pad on the left, one shared LCD screen on the
 * right. The pad — or the labelled tabs across the top of the screen — pages
 * through Stats/Profile/Breeding/Abilities (height, weight and abilities live
 * here), so the sections are visible and reachable by pointer and keyboard.
 */
export function DataConsole({ pokemon, species, abilityDetails }: DataConsoleProps) {
  const [pageIndex, setPageIndex] = useState(0)
  const page = PAGES[pageIndex]

  const step = (delta: number) => setPageIndex((i) => (i + delta + PAGES.length) % PAGES.length)

  return (
    <div
      data-tour="console"
      className="device-console-frame flex items-center gap-2.5 rounded-2xl p-2"
    >
      <DPad onUp={() => step(-1)} onDown={() => step(1)} onLeft={() => step(-1)} onRight={() => step(1)} />

      <LcdScreen className="flex h-[130px] flex-1 flex-col px-3 py-1.5 sm:h-[150px]">
        <div
          className="no-scrollbar -mx-1 mb-1 flex items-center gap-1 overflow-x-auto border-b border-[#26340f]/30 px-1 pb-1"
          role="tablist"
          aria-label="Pokédex data sections"
        >
          {PAGES.map((p, i) => {
            const selected = i === pageIndex
            return (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setPageIndex(i)}
                className={`shrink-0 rounded px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] transition-colors ${
                  selected ? 'bg-[#16220a] text-[#dceca0]' : 'text-[#16220a]/85 hover:text-[#16220a]'
                }`}
                style={{ fontFamily: 'var(--font-lcd)' }}
              >
                {p}
              </button>
            )
          })}
        </div>
        <div
          className="no-scrollbar flex-1 overflow-y-auto"
          style={{ fontFamily: 'var(--font-lcd)' }}
          role="tabpanel"
          aria-label={page}
        >
          {page === 'Stats' && <StatsFields pokemon={pokemon} size="compact" />}
          {page === 'Profile' && <ProfileFields pokemon={pokemon} species={species} size="compact" />}
          {page === 'Breeding' && <BreedingFields species={species} size="compact" />}
          {page === 'Abilities' && <AbilitiesFields pokemon={pokemon} details={abilityDetails} size="compact" />}
        </div>
      </LcdScreen>
    </div>
  )
}
