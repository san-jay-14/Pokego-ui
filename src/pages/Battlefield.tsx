import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Swords, Trash2 } from 'lucide-react'
import type { Pokemon } from '@/types/pokemon'
import { useAppStore } from '@/store/useAppStore'
import { usePokemonDetail } from '@/hooks/usePokemonData'
import { getTypeConfig } from '@/constants/pokemonTypes'
import {
  artworkFromId,
  formatDexId,
  formatName,
  getAnimatedSprite,
  hasAnimatedSprite,
  primaryType,
} from '@/utils/pokemon'
import { PageContainer } from '@/components/layout/PageContainer'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { PokeballSpinner } from '@/components/ui/PokeballSpinner'
import { BattleArena } from '@/components/compare/BattleArena'
import { FighterPicker } from '@/components/compare/FighterPicker'

/** Where the diagonal seam crosses the hero — kept in sync with BattleArena. */
const SEAM_TOP = 57
const SEAM_BOTTOM = 43

/**
 * The Battlefield: a dedicated head-to-head page. Reads the two chosen
 * Pokémon from the compare store; when both are set it renders the full arena,
 * otherwise it prompts the visitor to pick their fighters.
 */
export function Battlefield() {
  const compare = useAppStore((s) => s.compare)
  const toggleCompare = useAppStore((s) => s.toggleCompare)
  const clearCompare = useAppStore((s) => s.clearCompare)

  const a = usePokemonDetail(compare[0] != null ? String(compare[0]) : undefined)
  const b = usePokemonDetail(compare[1] != null ? String(compare[1]) : undefined)
  const bothReady = Boolean(a.data && b.data)

  return (
    <PageContainer className="py-5 sm:py-6">
      <header className="mb-6 flex items-center gap-3">
        <Link
          to="/"
          aria-label="Back to Pokédex"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-surface text-muted transition-colors hover:border-border-strong hover:text-ink"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
        </Link>
        <div className="flex items-center gap-2">
          <Swords className="h-6 w-6 text-primary" strokeWidth={2.2} />
          <h1 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">Battlefield</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {compare.length > 0 && (
            <button
              type="button"
              onClick={clearCompare}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-2 text-sm font-semibold text-muted transition-colors hover:border-border-strong hover:text-ink"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>

      {bothReady ? (
        <BattleArena a={a.data as Pokemon} b={b.data as Pokemon} onRemove={toggleCompare} />
      ) : (
        <BattlePrompt
          chosen={compare}
          slotA={{ data: a.data, loading: a.isLoading }}
          slotB={{ data: b.data, loading: b.isLoading }}
          onPick={toggleCompare}
          onRemove={toggleCompare}
        />
      )}
    </PageContainer>
  )
}

interface SlotState {
  data: Pokemon | undefined
  loading: boolean
}

function BattlePrompt({
  chosen,
  slotA,
  slotB,
  onPick,
  onRemove,
}: {
  chosen: number[]
  slotA: SlotState
  slotB: SlotState
  onPick: (id: number) => void
  onRemove: (id: number) => void
}) {
  const cfgA = slotA.data ? getTypeConfig(primaryType(slotA.data)) : null
  const cfgB = slotB.data ? getTypeConfig(primaryType(slotB.data)) : null
  const neutral = 'linear-gradient(135deg, rgba(130,130,150,0.22), rgba(90,90,110,0.12))'

  return (
    <div className="flex flex-col gap-6">
      <div className="battle-hero relative isolate overflow-hidden rounded-[var(--radius-card)] border border-border shadow-[var(--shadow-md)]">
        <div
          className="absolute inset-0"
          style={{
            clipPath: `polygon(0 0, ${SEAM_TOP}% 0, ${SEAM_BOTTOM}% 100%, 0 100%)`,
            background: cfgA ? `linear-gradient(135deg, ${cfgA.from}, ${cfgA.to})` : neutral,
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0"
          style={{
            clipPath: `polygon(${SEAM_TOP}% 0, 100% 0, 100% 100%, ${SEAM_BOTTOM}% 100%)`,
            background: cfgB ? `linear-gradient(225deg, ${cfgB.from}, ${cfgB.to})` : neutral,
          }}
          aria-hidden="true"
        />
        <div
          className="battle-seam absolute inset-0"
          style={{
            clipPath: `polygon(${SEAM_TOP}% 0, ${SEAM_TOP + 2.5}% 0, ${SEAM_BOTTOM + 2.5}% 100%, ${SEAM_BOTTOM}% 100%)`,
          }}
          aria-hidden="true"
        />

        <div className="relative grid grid-cols-2">
          <PromptSlot slot={slotA} side="a" onRemove={onRemove} />
          <PromptSlot slot={slotB} side="b" onRemove={onRemove} />
        </div>

        <span className="pointer-events-none absolute left-1/2 top-1/2 z-10 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white/70 bg-black/55 text-sm font-black italic text-white shadow-lg backdrop-blur-sm sm:h-14 sm:w-14 sm:text-lg">
          VS
        </span>
      </div>

      <div className="text-center">
        <h2 className="text-lg font-bold text-ink sm:text-xl">Choose your fighters</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
          {chosen.length === 0
            ? 'Pick two Pokémon to send them into battle and compare them head-to-head.'
            : 'One more challenger — pick a second Pokémon to start the battle.'}
        </p>
      </div>

      <FighterPicker chosen={chosen} onPick={onPick} />
    </div>
  )
}

function PromptSlot({
  slot,
  side,
  onRemove,
}: {
  slot: SlotState
  side: 'a' | 'b'
  onRemove: (id: number) => void
}) {
  const isB = side === 'b'
  // A stable random silhouette to tease the empty slot.
  const teaseId = useMemo(() => Math.floor(Math.random() * 493) + 1, [])

  const wrap = `relative flex min-h-[190px] flex-col items-center justify-center gap-1 px-3 py-5 sm:min-h-[230px] sm:py-7 ${
    isB ? 'pl-8 sm:pl-12' : 'pr-8 sm:pr-12'
  }`

  if (slot.loading) {
    return (
      <div className={wrap}>
        <PokeballSpinner size={34} />
      </div>
    )
  }

  if (!slot.data) {
    return (
      <div className={wrap}>
        <div className="grid h-28 w-28 place-items-center rounded-full border-2 border-dashed border-white/60 sm:h-36 sm:w-36">
          <img
            src={artworkFromId(teaseId)}
            alt=""
            aria-hidden="true"
            className="h-20 w-20 object-contain opacity-25 grayscale sm:h-28 sm:w-28"
            style={{ transform: isB ? 'scaleX(-1)' : undefined }}
            draggable={false}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
        <span className="mt-2 rounded-full bg-black/30 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white/90 backdrop-blur-sm">
          Choose fighter
        </span>
      </div>
    )
  }

  const pokemon = slot.data
  const animated = hasAnimatedSprite(pokemon)
  return (
    <div className={wrap}>
      <img
        src={getAnimatedSprite(pokemon)}
        alt={formatName(pokemon.name)}
        className="h-24 w-24 object-contain sm:h-36 sm:w-36"
        style={{ transform: isB ? 'scaleX(-1)' : undefined, imageRendering: animated ? 'pixelated' : 'auto' }}
        draggable={false}
        onError={(e) => {
          e.currentTarget.onerror = null
          e.currentTarget.src = '/pokeball.svg'
          e.currentTarget.style.imageRendering = 'auto'
        }}
      />
      <span className="text-base font-black uppercase tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] sm:text-lg">
        {formatName(pokemon.name)}
      </span>
      <span className="tabular text-xs font-bold text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
        {formatDexId(pokemon.id)}
      </span>
      <button
        type="button"
        onClick={() => onRemove(pokemon.id)}
        aria-label={`Remove ${formatName(pokemon.name)}`}
        className={`absolute top-2 grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white opacity-80 backdrop-blur-sm transition-all hover:bg-black/65 hover:opacity-100 active:scale-90 ${isB ? 'right-2' : 'left-2'}`}
      >
        <span className="text-lg leading-none">×</span>
      </button>
    </div>
  )
}
