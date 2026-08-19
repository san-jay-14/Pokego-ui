import type { ReactNode } from 'react'
import { Dna, Egg, Ruler, Sparkles, Weight } from 'lucide-react'
import type { Pokemon, PokemonSpecies } from '@/types/pokemon'
import { STAT_META, formatHeight, formatName, formatWeight } from '@/utils/pokemon'
import { captureChancePct, formatGender, formatHatch } from '@/utils/species'
import { SectionCard, InfoTile } from './Section'

interface ProfilePanelProps {
  pokemon: Pokemon
  species: PokemonSpecies | undefined
}

function evYield(pokemon: Pokemon): string {
  const yields = pokemon.stats
    .filter((s) => s.effort > 0)
    .map((s) => `${s.effort} ${STAT_META.find((m) => m.key === s.stat.name)?.short ?? s.stat.name}`)
  return yields.length ? yields.join(', ') : '—'
}

/** Physical profile, training and breeding data — most of it from the species API. */
export function ProfilePanel({ pokemon, species }: ProfilePanelProps) {
  return (
    <SectionCard title="Profile" icon={<Dna className="h-4 w-4" />}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <InfoTile icon={<Ruler className="h-4 w-4" />} label="Height" value={formatHeight(pokemon.height)} />
        <InfoTile icon={<Weight className="h-4 w-4" />} label="Weight" value={formatWeight(pokemon.weight)} />
        <InfoTile icon={<Sparkles className="h-4 w-4" />} label="Base exp" value={pokemon.base_experience ?? '—'} />
        {species && (
          <>
            <InfoTile label="Generation" value={genLabel(species.generation.name)} />
            <InfoTile label="Habitat" value={species.habitat ? formatName(species.habitat.name) : '—'} />
            <InfoTile label="Shape" value={species.shape ? formatName(species.shape.name) : '—'} />
          </>
        )}
      </div>

      {species && (
        <>
          <Subheading>Training</Subheading>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <InfoTile label="EV yield" value={<span className="text-sm">{evYield(pokemon)}</span>} />
            <InfoTile label="Base friendship" value={species.base_happiness ?? '—'} />
            <InfoTile label="Growth rate" value={<span className="text-sm">{species.growth_rate ? formatName(species.growth_rate.name) : '—'}</span>} />
            <div className="col-span-2 rounded-xl border border-border bg-surface-2 px-3.5 py-3 sm:col-span-3">
              <div className="flex items-center justify-between text-muted">
                <span className="text-xs font-semibold uppercase tracking-wide">Catch rate</span>
                <span className="tabular text-sm font-bold text-ink">
                  {species.capture_rate} · ~{captureChancePct(species.capture_rate)}%
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-inset">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.round((species.capture_rate / 255) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <Subheading>Breeding</Subheading>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <InfoTile icon={<Dna className="h-4 w-4" />} label="Gender" value={<span className="text-sm">{formatGender(species.gender_rate)}</span>} />
            <InfoTile icon={<Egg className="h-4 w-4" />} label="Egg groups" value={<span className="text-sm">{species.egg_groups.map((g) => formatName(g.name)).join(', ') || '—'}</span>} />
            <InfoTile label="Hatch time" value={<span className="text-sm">{formatHatch(species.hatch_counter)}</span>} />
          </div>
        </>
      )}

      {pokemon.held_items && pokemon.held_items.length > 0 && (
        <>
          <Subheading>Held items</Subheading>
          <div className="flex flex-wrap gap-2">
            {pokemon.held_items.map((h) => (
              <span key={h.item.name} className="rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-ink">
                {formatName(h.item.name)}
              </span>
            ))}
          </div>
        </>
      )}
    </SectionCard>
  )
}

function Subheading({ children }: { children: ReactNode }) {
  return (
    <h4 className="mb-2.5 mt-5 text-xs font-semibold uppercase tracking-wide text-muted">{children}</h4>
  )
}

function genLabel(gen: string): string {
  // "generation-i" -> "Gen I"
  const roman = gen.replace('generation-', '').toUpperCase()
  return `Gen ${roman}`
}
