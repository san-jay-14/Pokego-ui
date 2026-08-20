import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDexId } from '@/utils/pokemon'

interface DeviceNavProps {
  /** Current dex id — bounds the previous button and seeds the jump field. */
  id: number
}

/**
 * The device's control cluster: previous / next dex stepping plus a
 * jump-to-number field, styled as chunky console buttons.
 */
export function DeviceNav({ id }: DeviceNavProps) {
  const navigate = useNavigate()
  const [jump, setJump] = useState('')

  const go = (target: number) => {
    if (target >= 1) navigate(`/pokemon/${target}`)
  }

  const submitJump = (e: React.FormEvent) => {
    e.preventDefault()
    const n = Number(jump)
    if (Number.isInteger(n) && n >= 1) {
      navigate(`/pokemon/${n}`)
      setJump('')
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5">
        <NavButton
          onClick={() => go(id - 1)}
          disabled={id <= 1}
          label={`Previous Pokémon, ${formatDexId(id - 1)}`}
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.6} />
        </NavButton>
        <NavButton onClick={() => go(id + 1)} label={`Next Pokémon, ${formatDexId(id + 1)}`}>
          <ChevronRight className="h-4 w-4" strokeWidth={2.6} />
        </NavButton>
      </div>

      <form onSubmit={submitJump} className="flex items-center gap-1.5">
        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-white/50">Go to</span>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={jump}
          onChange={(e) => setJump(e.target.value)}
          placeholder={String(id)}
          aria-label="Jump to Pokédex number"
          className="lcd h-7 w-14 rounded-md px-2 text-center text-base font-bold outline-none placeholder:text-[#26340f]/40 focus-visible:ring-2 focus-visible:ring-white/60"
        />
        <button
          type="submit"
          className="rounded-full border-2 border-[#5f845e] bg-[#5ed75e] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#0e3d10] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition-colors hover:border-[#85ec4d] active:scale-95"
          aria-label="Go to number"
        >
          Go
        </button>
      </form>
    </div>
  )
}

function NavButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="chrome-btn m-0.5 grid h-7 w-7 place-items-center rounded-full text-white transition-transform active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}
