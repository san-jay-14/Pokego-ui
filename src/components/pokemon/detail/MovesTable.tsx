import { Swords } from 'lucide-react'
import type { MoveDetail, Pokemon } from '@/types/pokemon'
import { getTypeConfig } from '@/constants/pokemonTypes'
import { formatName } from '@/utils/pokemon'
import { getLevelUpMoves } from '@/utils/species'
import { SectionCard } from './Section'

interface MovesTableProps {
  pokemon: Pokemon
  details: Map<string, MoveDetail>
  machineCount: number
}

const CATEGORY_LABEL: Record<string, string> = {
  physical: 'Physical',
  special: 'Special',
  status: 'Status',
}

/** Level-up learnset with each move's real type, category, power, accuracy, PP. */
export function MovesTable({ pokemon, details, machineCount }: MovesTableProps) {
  const moves = getLevelUpMoves(pokemon)

  return (
    <SectionCard
      title="Moves"
      icon={<Swords className="h-4 w-4" />}
      subtitle={`${moves.length} by level-up · ${machineCount} by TM`}
    >
      {moves.length === 0 ? (
        <p className="text-sm text-muted">No level-up moves listed.</p>
      ) : (
        <div className="max-h-96 overflow-y-auto overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[26rem] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-surface-2 text-left">
              <tr className="text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-3 py-2.5">Lv</th>
                <th className="px-3 py-2.5">Move</th>
                <th className="px-3 py-2.5">Type</th>
                <th className="hidden px-3 py-2.5 sm:table-cell">Cat</th>
                <th className="px-3 py-2.5 text-right">Pwr</th>
                <th className="hidden px-3 py-2.5 text-right sm:table-cell">Acc</th>
                <th className="px-3 py-2.5 text-right">PP</th>
              </tr>
            </thead>
            <tbody>
              {moves.map((m) => {
                const d = details.get(m.name)
                const cfg = d ? getTypeConfig(d.type.name) : null
                return (
                  <tr key={m.name} className="border-t border-border">
                    <td className="tabular px-3 py-2.5 font-bold text-ink">{m.level}</td>
                    <td className="px-3 py-2.5 font-medium text-ink">{formatName(m.name)}</td>
                    <td className="px-3 py-2.5">
                      {cfg ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold"
                          style={{ backgroundColor: cfg.color, color: cfg.onColor }}
                        >
                          <span aria-hidden="true">{cfg.emoji}</span>
                          {cfg.label}
                        </span>
                      ) : (
                        <span className="skeleton inline-block h-4 w-14 rounded-full" />
                      )}
                    </td>
                    <td className="hidden px-3 py-2.5 text-muted sm:table-cell">
                      {d ? CATEGORY_LABEL[d.damage_class?.name ?? ''] ?? '—' : ''}
                    </td>
                    <td className="tabular px-3 py-2.5 text-right text-ink">{d ? d.power ?? '—' : ''}</td>
                    <td className="tabular hidden px-3 py-2.5 text-right text-muted sm:table-cell">
                      {d ? (d.accuracy != null ? `${d.accuracy}%` : '—') : ''}
                    </td>
                    <td className="tabular px-3 py-2.5 text-right text-muted">{d ? d.pp ?? '—' : ''}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  )
}
