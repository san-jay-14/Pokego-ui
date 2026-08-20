import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Swords, Trash2 } from 'lucide-react'
import type { Pokemon } from '@/types/pokemon'
import { useAppStore } from '@/store/useAppStore'
import { usePokemonDetail } from '@/hooks/usePokemonData'
import { getTypeConfig } from '@/constants/pokemonTypes'
import { getTypeBackground } from '@/constants/typeBackgrounds'
import { artworkFromId, primaryType } from '@/utils/pokemon'
import { PageContainer } from '@/components/layout/PageContainer'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { PokeballIcon } from '@/components/ui/PokeballIcon'
import { PokeballSpinner } from '@/components/ui/PokeballSpinner'
import {
  BattleArena,
  ClippedSide,
  Fighter,
  SEAM_BOTTOM,
  SEAM_TOP,
} from '@/components/compare/BattleArena'
import { FighterPicker } from '@/components/compare/FighterPicker'

/**
 * The Battlefield: a dedicated head-to-head page. Reads the two chosen
 * Pokémon from the compare store; when both are set it renders the full arena,
 * otherwise it prompts the visitor to pick their fighters.
 */
export function Battlefield() {
  const navigate = useNavigate()
  const compare = useAppStore((s) => s.compare)
  const toggleCompare = useAppStore((s) => s.toggleCompare)
  const clearCompare = useAppStore((s) => s.clearCompare)

  const leaveBattlefield = () => {
    clearCompare()
    navigate('/')
  }

  const a = usePokemonDetail(compare[0] != null ? String(compare[0]) : undefined)
  const b = usePokemonDetail(compare[1] != null ? String(compare[1]) : undefined)
  const bothReady = Boolean(a.data && b.data)

  return (
    <div className="relative min-h-dvh">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/battlefield_bg.png')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-10 bg-bg/55" aria-hidden="true" />

      <PageContainer className="relative py-5 sm:py-6">
      <header className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={leaveBattlefield}
          aria-label="Back to Pokédex"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-surface text-muted transition-colors hover:border-border-strong hover:text-ink"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
        </button>
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
    </div>
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

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      {/* Same full-art diagonal hero as the arena — facets go neutral when empty. */}
      <div className="relative isolate overflow-hidden rounded-[var(--radius-card)] border border-white/10 shadow-[var(--shadow-lg)]">
        <ClippedSide
          clip={`polygon(0 0, ${SEAM_TOP}% 0, ${SEAM_BOTTOM}% 100%, 0 100%)`}
          cfg={cfgA}
          scene={slotA.data ? getTypeBackground(primaryType(slotA.data)) : null}
          deg={135}
        />
        <ClippedSide
          clip={`polygon(${SEAM_TOP}% 0, 100% 0, 100% 100%, ${SEAM_BOTTOM}% 100%)`}
          cfg={cfgB}
          scene={slotB.data ? getTypeBackground(primaryType(slotB.data)) : null}
          deg={225}
        />
        <div
          className="battle-seam absolute inset-0"
          style={{
            clipPath: `polygon(${SEAM_TOP}% 0, ${SEAM_TOP + 2.5}% 0, ${SEAM_BOTTOM + 2.5}% 100%, ${SEAM_BOTTOM}% 100%)`,
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 grid grid-cols-2">
          <PromptSlot slot={slotA} side="a" onRemove={onRemove} />
          <PromptSlot slot={slotB} side="b" onRemove={onRemove} />
        </div>

        <span className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <PokeballIcon
            size={96}
            className="h-16 w-16 drop-shadow-[0_6px_14px_rgba(0,0,0,0.7)] sm:h-24 sm:w-24"
          />
        </span>
      </div>

      <div className="text-center">
        <h2 className="text-lg font-black uppercase tracking-wide text-ink sm:text-xl">
          Choose your fighters
        </h2>
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

/** Shared fighter frame — matches the arena's Fighter so every slot lines up. */
const SLOT_FRAME = 'relative flex min-h-[290px] flex-col px-2 pb-4 pt-4 sm:min-h-[360px] sm:pb-5'

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
  const pad = isB ? 'pl-5 sm:pl-10' : 'pr-5 sm:pr-10'

  if (slot.loading) {
    return (
      <div className={`${SLOT_FRAME} ${pad}`}>
        <div className="relative z-10 flex flex-1 items-center justify-center">
          <PokeballSpinner size={40} />
        </div>
      </div>
    )
  }

  // A chosen fighter renders exactly like the arena so the two states match 1:1.
  if (slot.data) {
    return <Fighter pokemon={slot.data} side={side} onReplace={onRemove} />
  }

  return <EmptySlot side={side} />
}

/** Empty slot: the arena's Fighter frame with a teased silhouette and prompt. */
function EmptySlot({ side }: { side: 'a' | 'b' }) {
  const isB = side === 'b'
  const pad = isB ? 'pl-5 sm:pl-10' : 'pr-5 sm:pr-10'
  // A stable random silhouette to tease the empty slot.
  const teaseId = useMemo(() => Math.floor(Math.random() * 493) + 1, [])

  return (
    <div className={`${SLOT_FRAME} ${pad}`}>
      {/* Teased silhouette */}
      <div className="relative z-10 flex flex-1 items-center justify-center">
        <div className="grid h-28 w-28 place-items-center rounded-full border-2 border-dashed border-border-strong sm:h-40 sm:w-40">
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
      </div>

      {/* Prompt label — sits where Fighter's name/type chips go. */}
      <div className="relative z-10 mt-2 flex flex-col items-center gap-1.5">
        <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white/90 backdrop-blur-sm sm:text-sm">
          Choose fighter
        </span>
      </div>
    </div>
  )
}
