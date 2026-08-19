import { Globe } from 'lucide-react'
import type { PokemonSpecies } from '@/types/pokemon'
import { LOCALIZED_LANGUAGES, formatPokedexName } from '@/utils/species'
import { SectionCard } from './Section'

interface NamesPanelProps {
  species: PokemonSpecies | undefined
}

/** Localized names across languages + this Pokémon's regional dex numbers. */
export function NamesPanel({ species }: NamesPanelProps) {
  if (!species) return null

  const names = LOCALIZED_LANGUAGES.map((lang) => ({
    label: lang.label,
    value: species.names.find((n) => n.language.name === lang.code)?.name,
  })).filter((n) => n.value)

  const dex = species.pokedex_numbers

  if (names.length === 0 && dex.length === 0) return null

  return (
    <SectionCard title="Names & dex numbers" icon={<Globe className="h-4 w-4" />}>
      {names.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
          {names.map((n) => (
            <div key={n.label} className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">{n.label}</span>
              <span className="text-base font-medium text-ink">{n.value}</span>
            </div>
          ))}
        </div>
      )}

      {dex.length > 0 && (
        <>
          <h4 className="mb-2.5 mt-5 text-xs font-semibold uppercase tracking-wide text-muted">
            Regional Pokédex
          </h4>
          <div className="flex flex-wrap gap-2">
            {dex.map((d) => (
              <span
                key={d.pokedex.name}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-ink"
              >
                {formatPokedexName(d.pokedex.name)}
                <span className="tabular font-bold text-muted">
                  #{String(d.entry_number).padStart(3, '0')}
                </span>
              </span>
            ))}
          </div>
        </>
      )}
    </SectionCard>
  )
}
