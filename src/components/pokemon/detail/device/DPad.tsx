import type { ReactNode } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react'

interface DPadProps {
  onUp: () => void
  onDown: () => void
  onLeft: () => void
  onRight: () => void
}

/** The classic handheld 4-way directional pad — a raised charcoal cross on a black base. */
export function DPad({ onUp, onDown, onLeft, onRight }: DPadProps) {
  return (
    <div
      className="grid h-14 w-14 shrink-0 grid-cols-3 grid-rows-3 gap-[2px] rounded-xl p-[2px]"
      style={{
        background: 'linear-gradient(160deg, #3a3a40 0%, #1c1c21 55%, #08080a 100%)',
        boxShadow:
          'inset 0 1px 1px rgba(255,255,255,0.12), inset 0 -2px 4px rgba(0,0,0,0.65), 0 2px 4px rgba(0,0,0,0.5)',
      }}
    >
      <span aria-hidden="true" />
      <DPadButton label="Previous section" onClick={onUp} rounded="rounded-t-md">
        <ChevronUp className="h-3.5 w-3.5" strokeWidth={3} />
      </DPadButton>
      <span aria-hidden="true" />

      <DPadButton label="Previous section" onClick={onLeft} rounded="rounded-l-md">
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={3} />
      </DPadButton>
      <span
        aria-hidden="true"
        className="rounded-full"
        style={{
          background: 'radial-gradient(circle at 40% 32%, #2a2a2f, #050506 75%)',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)',
        }}
      />
      <DPadButton label="Next section" onClick={onRight} rounded="rounded-r-md">
        <ChevronRight className="h-3.5 w-3.5" strokeWidth={3} />
      </DPadButton>

      <span aria-hidden="true" />
      <DPadButton label="Next section" onClick={onDown} rounded="rounded-b-md">
        <ChevronDown className="h-3.5 w-3.5" strokeWidth={3} />
      </DPadButton>
      <span aria-hidden="true" />
    </div>
  )
}

function DPadButton({
  label,
  onClick,
  rounded,
  children,
}: {
  label: string
  onClick: () => void
  rounded: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`grid place-items-center text-white/50 transition-transform active:scale-90 active:text-white/70 ${rounded}`}
      style={{
        background: 'linear-gradient(160deg, #4c4c53 0%, #26262b 60%, #131315 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 2px rgba(0,0,0,0.55)',
      }}
    >
      {children}
    </button>
  )
}
