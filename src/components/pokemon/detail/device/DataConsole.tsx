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
 * right. The pad pages through Stats/Profile/Breeding/Abilities instead of
 * stacking every readout at once.
 */
export function DataConsole({ pokemon, species, abilityDetails }: DataConsoleProps) {
  const [pageIndex, setPageIndex] = useState(0)
  const page = PAGES[pageIndex]

  const step = (delta: number) => setPageIndex((i) => (i + delta + PAGES.length) % PAGES.length)

  return (
    <div className="device-console-frame flex items-center gap-2.5 rounded-2xl p-2">
      <DPad onUp={() => step(-1)} onDown={() => step(1)} onLeft={() => step(-1)} onRight={() => step(1)} />

      <LcdScreen className="flex h-[130px] flex-1 flex-col px-3 py-1.5 sm:h-[150px]">
        <div className="mb-1 flex items-center justify-between border-b border-[#26340f]/30 pb-0.5">
          <h4
            className="text-[0.65rem] font-bold uppercase tracking-[0.18em]"
            style={{ fontFamily: 'var(--font-lcd)' }}
          >
            {page}
          </h4>
          <div className="flex gap-1" aria-hidden="true">
            {PAGES.map((p, i) => (
              <span
                key={p}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === pageIndex ? 'bg-[#26340f]/70' : 'bg-[#26340f]/25'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto" style={{ fontFamily: 'var(--font-lcd)' }}>
          {page === 'Stats' && <StatsFields pokemon={pokemon} size="compact" />}
          {page === 'Profile' && <ProfileFields pokemon={pokemon} species={species} size="compact" />}
          {page === 'Breeding' && <BreedingFields species={species} size="compact" />}
          {page === 'Abilities' && <AbilitiesFields pokemon={pokemon} details={abilityDetails} size="compact" />}
        </div>
      </LcdScreen>
    </div>
  )
}
