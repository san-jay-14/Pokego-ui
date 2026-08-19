import { Shield } from 'lucide-react'
import { getTypeConfig } from '@/constants/pokemonTypes'
import type { Effectiveness, TypeEffectiveness } from '@/utils/typeEffectiveness'
import { formatMultiplier } from '@/utils/typeEffectiveness'
import type { PokemonTypeName } from '@/types/pokemon'
import { SectionCard } from './Section'

interface TypeDefensesProps {
  effectiveness: TypeEffectiveness | undefined
  isLoading: boolean
}

/** Real defensive type chart derived from the API's damage relations. */
export function TypeDefenses({ effectiveness, isLoading }: TypeDefensesProps) {
  return (
    <SectionCard title="Type defenses" icon={<Shield className="h-4 w-4" />}>
      {isLoading || !effectiveness ? (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="skeleton h-3 w-24 rounded" />
              <div className="skeleton h-7 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Group label="Weak to" tone="danger" items={effectiveness.weak} />
          <Group label="Resistant to" tone="success" items={effectiveness.resist} />
          {effectiveness.immune.length > 0 && (
            <Group
              label="Immune to"
              tone="muted"
              items={effectiveness.immune.map((type) => ({ type, multiplier: 0 }))}
            />
          )}
        </div>
      )}
    </SectionCard>
  )
}

function Group({
  label,
  tone,
  items,
}: {
  label: string
  tone: 'danger' | 'success' | 'muted'
  items: Effectiveness[]
}) {
  const toneClass =
    tone === 'danger' ? 'text-danger' : tone === 'success' ? 'text-success' : 'text-muted'
  return (
    <div>
      <p className={`mb-2 text-xs font-semibold uppercase tracking-wide ${toneClass}`}>{label}</p>
      {items.length === 0 ? (
        <p className="text-sm text-muted">None</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((it) => (
            <TypePill key={it.type} type={it.type} multiplier={it.multiplier} />
          ))}
        </div>
      )}
    </div>
  )
}

function TypePill({ type, multiplier }: { type: PokemonTypeName; multiplier: number }) {
  const cfg = getTypeConfig(type)
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: `color-mix(in srgb, ${cfg.color} 16%, transparent)`, color: cfg.color }}
    >
      <span aria-hidden="true">{cfg.emoji}</span>
      {cfg.label}
      {multiplier !== 0 && (
        <span className="tabular rounded bg-black/10 px-1 text-[0.65rem] dark:bg-white/15">
          {formatMultiplier(multiplier)}
        </span>
      )}
    </span>
  )
}
