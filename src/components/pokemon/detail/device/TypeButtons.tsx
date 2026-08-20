import type { PokemonTypeSlot } from '@/types/pokemon'
import { getTypeConfig } from '@/constants/pokemonTypes'
import { EnergyPip } from '@/components/pokemon/EnergyPip'

/** The "TYPES" header + one raised button per type, as on the classic device. */
export function TypeButtons({ types }: { types: PokemonTypeSlot[] }) {
  return (
    <div className="flex min-w-[7.5rem] flex-col gap-1">
      <div className="rounded-md bg-gradient-to-b from-[#c0272c] to-[#8f1418] px-2.5 py-1 text-center text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_1px_2px_rgba(0,0,0,0.3)]">
        Types
      </div>
      {types.map((t) => {
        const cfg = getTypeConfig(t.type.name)
        return (
          <span
            key={t.type.name}
            className="inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-2px_3px_rgba(0,0,0,0.25),0_1px_2px_rgba(0,0,0,0.3)]"
            style={{ background: `linear-gradient(160deg, ${cfg.from}, ${cfg.to})` }}
          >
            <EnergyPip type={t.type.name} size={14} />
            {cfg.label}
          </span>
        )
      })}
    </div>
  )
}
