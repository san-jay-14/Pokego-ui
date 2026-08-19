import { Link } from 'react-router-dom'
import { ChevronRight, GitBranch } from 'lucide-react'
import type { ChainLink, EvolutionChain as Chain } from '@/types/pokemon'
import { idFromUrl } from '@/services/pokemonApi'
import { artworkFromId, formatDexId, formatName } from '@/utils/pokemon'
import { formatEvolutionTrigger } from '@/utils/species'
import { SectionCard } from './Section'

interface EvolutionChainProps {
  chain: Chain | undefined
  isLoading: boolean
  currentId: number
}

/** Renders the full evolution tree (branches included) as linked stages. */
export function EvolutionChain({ chain, isLoading, currentId }: EvolutionChainProps) {
  const hasEvolutions = chain ? chain.chain.evolves_to.length > 0 : false

  return (
    <SectionCard title="Evolution" icon={<GitBranch className="h-4 w-4" />}>
      {isLoading ? (
        <div className="flex items-center gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-24 w-24 rounded-2xl" />
          ))}
        </div>
      ) : !chain || !hasEvolutions ? (
        <p className="text-sm text-muted">This Pokémon doesn’t evolve.</p>
      ) : (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-4 overflow-x-auto">
          <ChainNode link={chain.chain} currentId={currentId} />
        </div>
      )}
    </SectionCard>
  )
}

/** One species node followed by its (possibly multiple) evolutions. */
function ChainNode({ link, currentId }: { link: ChainLink; currentId: number }) {
  return (
    <div className="flex items-center gap-2">
      <Stage
        name={link.species.name}
        id={idFromUrl(link.species.url)}
        current={idFromUrl(link.species.url) === currentId}
      />
      {link.evolves_to.length > 0 && (
        <div className="flex flex-col gap-3">
          {link.evolves_to.map((next) => (
            <div key={next.species.name} className="flex items-center gap-2">
              <Arrow label={formatEvolutionTrigger(next.evolution_details)} />
              <ChainNode link={next} currentId={currentId} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Stage({ name, id, current }: { name: string; id: number; current: boolean }) {
  return (
    <Link
      to={`/pokemon/${name}`}
      className={`group flex shrink-0 flex-col items-center rounded-2xl border p-2 transition-colors ${
        current ? 'border-primary/50 bg-primary-soft' : 'border-border bg-surface-2 hover:border-border-strong'
      }`}
    >
      <img
        src={artworkFromId(id)}
        alt={formatName(name)}
        loading="lazy"
        className="h-16 w-16 object-contain transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20"
        draggable={false}
        onError={(e) => {
          e.currentTarget.onerror = null
          e.currentTarget.src = '/pokeball.svg'
          e.currentTarget.classList.add('opacity-40')
        }}
      />
      <span className="text-sm font-semibold text-ink">{formatName(name)}</span>
      <span className="tabular text-xs text-faint">{formatDexId(id)}</span>
    </Link>
  )
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center px-1 text-muted">
      <ChevronRight className="h-5 w-5" strokeWidth={2.4} />
      {label && <span className="mt-0.5 max-w-20 text-center text-[0.65rem] font-medium leading-tight">{label}</span>}
    </div>
  )
}
