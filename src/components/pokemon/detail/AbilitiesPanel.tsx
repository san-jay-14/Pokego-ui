import { Zap } from 'lucide-react'
import type { AbilityDetail, Pokemon } from '@/types/pokemon'
import { formatName } from '@/utils/pokemon'
import { SectionCard } from './Section'

interface AbilitiesPanelProps {
  pokemon: Pokemon
  details: Map<string, AbilityDetail>
}

function shortEffect(detail: AbilityDetail | undefined): string {
  const entry = detail?.effect_entries.find((e) => e.language.name === 'en')
  return entry?.short_effect.replace(/\s+/g, ' ').trim() ?? ''
}

/** Abilities with their real in-game effect text. */
export function AbilitiesPanel({ pokemon, details }: AbilitiesPanelProps) {
  return (
    <SectionCard title="Abilities" icon={<Zap className="h-4 w-4" />}>
      <div className="flex flex-col gap-3">
        {pokemon.abilities.map((a) => {
          const effect = shortEffect(details.get(a.ability.name))
          return (
            <div key={a.ability.name} className="rounded-xl border border-border bg-surface-2 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-ink">{formatName(a.ability.name)}</span>
                {a.is_hidden && (
                  <span className="rounded bg-primary-soft px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase text-primary">
                    Hidden
                  </span>
                )}
              </div>
              {effect ? (
                <p className="mt-1 text-sm leading-relaxed text-muted">{effect}</p>
              ) : (
                <div className="skeleton mt-2 h-3 w-3/4 rounded" />
              )}
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}
