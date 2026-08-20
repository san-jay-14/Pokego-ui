import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ChainLink, EvolutionChain as Chain } from '@/types/pokemon'
import { idFromUrl } from '@/services/pokemonApi'
import { artworkFromId, formatName } from '@/utils/pokemon'
import { formatEvolutionTrigger } from '@/utils/species'

interface EvolutionRailProps {
  chain: Chain | undefined
  isLoading: boolean
  currentId: number
}

/** Every root-to-leaf path through the chain — one entry per branch combination. */
function enumeratePaths(link: ChainLink): ChainLink[][] {
  if (link.evolves_to.length === 0) return [[link]]
  const paths: ChainLink[][] = []
  for (const next of link.evolves_to) {
    for (const sub of enumeratePaths(next)) paths.push([link, ...sub])
  }
  return paths
}

const ROMAN = ['I', 'II', 'III', 'IV']

/**
 * Evolution stages as green mini-screens (I · II · III) linked with arrows.
 * Branchy chains (Eevee, Tyrogue, Wurmple…) are split into single linear
 * paths, paged with prev/next buttons instead of stacking every branch.
 */
export function EvolutionRail({ chain, isLoading, currentId }: EvolutionRailProps) {
  const paths = useMemo(() => (chain ? enumeratePaths(chain.chain) : []), [chain])
  const defaultIndex = useMemo(() => {
    const i = paths.findIndex((path) => path.some((link) => idFromUrl(link.species.url) === currentId))
    return i === -1 ? 0 : i
  }, [paths, currentId])
  const [pathIndex, setPathIndex] = useState(defaultIndex)

  if (isLoading) {
    return (
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="lcd h-16 flex-1 rounded-lg" />
        ))}
      </div>
    )
  }
  if (!chain || paths.length === 0) {
    return (
      <div className="lcd rounded-lg px-4 py-2 text-center text-base" style={{ fontFamily: 'var(--font-lcd)' }}>
        Does not evolve
      </div>
    )
  }

  const safeIndex = Math.min(pathIndex, paths.length - 1)
  const activePath = paths[safeIndex]
  const hasBranches = paths.length > 1
  const step = (delta: number) => setPathIndex((i) => (i + delta + paths.length) % paths.length)

  return (
    <div className="flex items-center gap-1.5">
      {hasBranches && (
        <NavButton direction="prev" onClick={() => step(-1)} label="Previous evolution branch" />
      )}

      <div className="no-scrollbar flex flex-1 items-stretch justify-center gap-1.5 overflow-x-auto">
        {activePath.map((link, i) => {
          const id = idFromUrl(link.species.url)
          return (
            <div key={link.species.name} className="flex items-center gap-1.5">
              {i > 0 && <Arrow label={formatEvolutionTrigger(link.evolution_details)} />}
              <Stage name={link.species.name} id={id} current={id === currentId} stage={ROMAN[i] ?? ''} />
            </div>
          )
        })}
      </div>

      {hasBranches && (
        <>
          <NavButton direction="next" onClick={() => step(1)} label="Next evolution branch" />
          <span
            className="tabular shrink-0 text-[0.6rem] font-bold text-white/60"
            style={{ fontFamily: 'var(--font-lcd)' }}
          >
            {safeIndex + 1}/{paths.length}
          </span>
        </>
      )}
    </div>
  )
}

function NavButton({
  direction,
  onClick,
  label,
}: {
  direction: 'prev' | 'next'
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="chrome-btn grid h-7 w-7 shrink-0 place-items-center rounded-full text-white transition-transform active:scale-90"
    >
      {direction === 'prev' ? (
        <ChevronLeft className="h-4 w-4" strokeWidth={2.6} />
      ) : (
        <ChevronRight className="h-4 w-4" strokeWidth={2.6} />
      )}
    </button>
  )
}

function Stage({ name, id, current, stage }: { name: string; id: number; current: boolean; stage: string }) {
  return (
    <Link
      to={`/pokemon/${name}`}
      className={`group flex shrink-0 flex-col items-center rounded-lg p-1 transition-transform hover:-translate-y-0.5 ${
        current ? 'ring-2 ring-amber-300' : ''
      }`}
    >
      <span className="text-[0.6rem] font-bold text-white/70" style={{ fontFamily: 'var(--font-lcd)' }}>
        {stage}
      </span>
      <span className="lcd grid h-12 w-12 place-items-center rounded-md sm:h-14 sm:w-14">
        <img
          src={artworkFromId(id)}
          alt={formatName(name)}
          loading="lazy"
          className="h-[85%] w-[85%] object-contain transition-transform duration-300 group-hover:scale-110"
          draggable={false}
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = '/pokeball.svg'
            e.currentTarget.classList.add('opacity-40')
          }}
        />
      </span>
      <span
        className="lcd mt-0.5 w-full truncate rounded px-1.5 py-0.5 text-center text-xs"
        style={{ fontFamily: 'var(--font-lcd)' }}
        title={formatName(name)}
      >
        {formatName(name)}
      </span>
    </Link>
  )
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center px-0.5 text-white/80">
      <ChevronRight className="h-4 w-4" strokeWidth={2.6} />
      {label && (
        <span className="mt-0.5 max-w-[4.5rem] text-center text-[0.6rem] font-medium leading-tight text-white/70">
          {label}
        </span>
      )}
    </div>
  )
}
