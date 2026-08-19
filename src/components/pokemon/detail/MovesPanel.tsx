import { useMemo, useState } from 'react'
import { Swords } from 'lucide-react'
import type { Pokemon } from '@/types/pokemon'
import { getTypeConfig } from '@/constants/pokemonTypes'
import { formatName } from '@/utils/pokemon'
import { getMovesByMethod, moveShortEffect, type LearnMethod, type LearnMove } from '@/utils/species'
import { useMoveDetails } from '@/hooks/usePokemonData'
import { SectionCard } from './Section'

const TABS: { method: LearnMethod; label: string }[] = [
  { method: 'level-up', label: 'Level-up' },
  { method: 'machine', label: 'TM' },
  { method: 'egg', label: 'Egg' },
  { method: 'tutor', label: 'Tutor' },
]

const CATEGORY_LABEL: Record<string, string> = {
  physical: 'Physical',
  special: 'Special',
  status: 'Status',
}

/** Full learnset, split by learn method, with each move's real battle data + effect. */
export function MovesPanel({ pokemon }: { pokemon: Pokemon }) {
  const byMethod = useMemo(() => {
    const map = {} as Record<LearnMethod, LearnMove[]>
    for (const t of TABS) map[t.method] = getMovesByMethod(pokemon, t.method)
    return map
  }, [pokemon])

  const available = TABS.filter((t) => byMethod[t.method].length > 0)
  const [tab, setTab] = useState<LearnMethod>('level-up')
  const activeTab = available.some((a) => a.method === tab) ? tab : available[0]?.method ?? 'level-up'
  const moves = byMethod[activeTab] ?? []
  const showLevel = activeTab === 'level-up'

  const names = useMemo(() => moves.map((m) => m.name), [moves])
  const { byName } = useMoveDetails(names)

  return (
    <SectionCard
      title="Moves"
      icon={<Swords className="h-4 w-4" />}
      subtitle={
        <div className="flex gap-1.5">
          {available.map((t) => (
            <button
              key={t.method}
              type="button"
              onClick={() => setTab(t.method)}
              aria-pressed={activeTab === t.method}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                activeTab === t.method
                  ? 'bg-primary text-primary-ink'
                  : 'border border-border text-muted hover:text-ink'
              }`}
            >
              {t.label}
              <span className="ml-1 opacity-70">{byMethod[t.method].length}</span>
            </button>
          ))}
        </div>
      }
    >
      {moves.length === 0 ? (
        <p className="text-sm text-muted">No moves in this category.</p>
      ) : (
        <div className="max-h-[28rem] overflow-y-auto overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[30rem] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-surface-2 text-left">
              <tr className="text-xs font-semibold uppercase tracking-wide text-muted">
                {showLevel && <th className="px-3 py-2.5">Lv</th>}
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
                const d = byName.get(m.name)
                const cfg = d ? getTypeConfig(d.type.name) : null
                const effect = moveShortEffect(d)
                return (
                  <tr key={m.name} className="border-t border-border align-top">
                    {showLevel && <td className="tabular px-3 py-2.5 font-bold text-ink">{m.level}</td>}
                    <td className="px-3 py-2.5">
                      <span className="font-medium text-ink">{formatName(m.name)}</span>
                      {effect && <span className="mt-0.5 line-clamp-1 max-w-[16rem] text-xs text-muted">{effect}</span>}
                    </td>
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
