import { useState } from 'react'
import { Scale, X } from 'lucide-react'
import { useAppStore, COMPARE_LIMIT } from '@/store/useAppStore'
import { usePokemonDetail } from '@/hooks/usePokemonData'
import { getArtwork, formatName } from '@/utils/pokemon'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PokeballSpinner } from '@/components/ui/PokeballSpinner'
import { CompareView } from './CompareView'

/**
 * Bottom tray that surfaces the current compare selection and opens the
 * side-by-side comparison once two Pokémon are chosen. Fetches details for the
 * selected ids (shared with the rest of the app's cache).
 */
export function CompareTray() {
  const compare = useAppStore((s) => s.compare)
  const clearCompare = useAppStore((s) => s.clearCompare)
  const [open, setOpen] = useState(false)

  const first = usePokemonDetail(compare[0] ? String(compare[0]) : undefined)
  const second = usePokemonDetail(compare[1] ? String(compare[1]) : undefined)

  if (compare.length === 0) return null

  const ready = compare.length === COMPARE_LIMIT && first.data && second.data

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4">
        <div className="animate-float-in pointer-events-auto flex w-full max-w-xl items-center gap-3 rounded-2xl border border-border bg-surface/90 p-2.5 pl-3 shadow-[var(--shadow-lg)] backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <Slot detail={first} index={0} />
            <span className="text-sm font-bold text-faint">vs</span>
            <Slot detail={second} index={1} />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              disabled={!ready}
              onClick={() => setOpen(true)}
            >
              <Scale className="h-4 w-4" />
              Compare
            </Button>
            <button
              type="button"
              onClick={clearCompare}
              aria-label="Clear comparison"
              className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <X className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>

      <Modal open={open && Boolean(ready)} onClose={() => setOpen(false)} title="Compare Pokémon">
        {first.data && second.data && <CompareView a={first.data} b={second.data} />}
      </Modal>
    </>
  )
}

interface SlotProps {
  detail: ReturnType<typeof usePokemonDetail>
  index: number
}

function Slot({ detail, index }: SlotProps) {
  if (!detail.data) {
    return (
      <span className="grid h-11 w-11 place-items-center rounded-xl border border-dashed border-border-strong bg-surface-2 text-faint">
        {detail.isLoading ? <PokeballSpinner size={16} /> : <span className="text-xs">{index + 1}</span>}
      </span>
    )
  }
  return (
    <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface-2" title={formatName(detail.data.name)}>
      <img
        src={getArtwork(detail.data)}
        alt={formatName(detail.data.name)}
        onError={(e) => {
          e.currentTarget.onerror = null
          e.currentTarget.src = '/pokeball.svg'
          e.currentTarget.classList.add('opacity-40')
        }}
        className="h-9 w-9 object-contain"
        draggable={false}
      />
    </span>
  )
}
