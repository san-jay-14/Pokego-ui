import { MapPin } from 'lucide-react'
import type { LocationAreaEncounter } from '@/types/pokemon'
import { formatName } from '@/utils/pokemon'
import { formatLocationArea } from '@/utils/species'
import { SectionCard } from './Section'

interface EncountersPanelProps {
  encounters: LocationAreaEncounter[] | undefined
  isLoading: boolean
}

/** Wild-encounter locations, grouped by area with the games and level ranges. */
export function EncountersPanel({ encounters, isLoading }: EncountersPanelProps) {
  return (
    <SectionCard
      title="Where to find"
      icon={<MapPin className="h-4 w-4" />}
      subtitle={encounters && encounters.length > 0 ? `${encounters.length} locations` : undefined}
    >
      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-12 rounded-xl" />
          ))}
        </div>
      ) : !encounters || encounters.length === 0 ? (
        <p className="text-sm text-muted">
          Not found in the wild — obtained through evolution, breeding, trade or special events.
        </p>
      ) : (
        <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
          {encounters.map((enc) => {
            const levels = enc.version_details
              .flatMap((v) => v.encounter_details)
              .map((d) => [d.min_level, d.max_level])
            const min = Math.min(...levels.map((l) => l[0]))
            const max = Math.max(...levels.map((l) => l[1]))
            const versions = [...new Set(enc.version_details.map((v) => formatName(v.version.name)))]
            return (
              <div key={enc.location_area.name} className="rounded-xl border border-border bg-surface-2 px-3.5 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-ink">{formatLocationArea(enc.location_area.name)}</span>
                  <span className="tabular shrink-0 text-xs font-semibold text-muted">
                    Lv. {min === max ? min : `${min}–${max}`}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">{versions.join(' · ')}</p>
              </div>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}
