import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

/** localStorage flag — set once a visitor has seen (or skipped) the tour. */
export const TOUR_SEEN_KEY = 'pokedex-tour-seen'

interface TourStep {
  /** `data-tour` target to spotlight, or null for a full-screen intro/outro. */
  selector: string | null
  title: string
  body: string
}

/**
 * Ash walks a first-time visitor through the Pokédex device, spotlighting each
 * screen and control. The key one is the data console — without this, height /
 * weight / abilities hide behind an undiscovered D-pad. Steps map to the
 * `data-tour="…"` markers placed on the device in `Pokedex.tsx`.
 */
const STEPS: TourStep[] = [
  {
    selector: null,
    title: 'This is the Pokédex',
    body: "Hey, I'm Ash! This device holds the data on every Pokémon. Let me show you around — use the buttons below, or your ← → keys.",
  },
  {
    selector: '[data-tour="name"]',
    title: 'Name & number',
    body: 'The Pokémon’s name and dex number. Tap the ◀ ▶ arrows to read its name in other languages — Japanese, French, German and more.',
  },
  {
    selector: '[data-tour="sprite"]',
    title: 'The viewing screen',
    body: 'Here’s the Pokémon itself. Tap the little dials around the screen to see its shiny colours, switch gender, or spin the sprite.',
  },
  {
    selector: '[data-tour="entry"]',
    title: 'Pokédex entry',
    body: 'This green screen is the classic Pokédex entry — a note on the Pokémon’s habits and biology.',
  },
  {
    selector: '[data-tour="types"]',
    title: 'Types & forms',
    body: 'These badges show the Pokémon’s type(s). If it has alternate forms, a selector appears here so you can switch between them.',
  },
  {
    selector: '[data-tour="console"]',
    title: 'The data console',
    body: 'Press the black D-pad — or the tabs on the screen — to page through Stats, Profile (height & weight), Breeding and Abilities. This is where the real details live!',
  },
  {
    selector: '[data-tour="evolution"]',
    title: 'Evolution line',
    body: 'The full evolution chain. Tap any stage to jump straight to that Pokémon’s own entry.',
  },
  {
    selector: '[data-tour="moves"]',
    title: 'Move list',
    body: 'Browse every move this Pokémon can learn — with its real power, accuracy and type.',
  },
  {
    selector: '[data-tour="nav"]',
    title: 'Browse the dex',
    body: 'Step to the previous or next Pokémon without ever leaving the Pokédex.',
  },
  {
    selector: '[data-tour="help"]',
    title: 'You’re all set!',
    body: 'That’s the tour. Tap this ? button on the Pokédex any time to run it again. Now go catch ’em all!',
  },
]

interface SpotRect {
  top: number
  left: number
  width: number
  height: number
}

const PAD = 8

type Placement = 'bottom-left' | 'bottom-right' | 'top-right' | 'top-left'

/** Corner-anchor order we prefer when placing Ash + the bubble. */
const PLACEMENTS: Placement[] = ['bottom-left', 'bottom-right', 'top-right', 'top-left']

/**
 * Pick the screen corner for the Ash + bubble cluster that does NOT cover the
 * highlighted element. Tries each corner in preference order and returns the
 * first with zero overlap (falling back to the least-overlapping one). Keeps
 * Ash bottom-left for the intro/outro, where there's nothing to avoid.
 */
function pickPlacement(
  rect: SpotRect | null,
  cluster: { w: number; h: number },
): Placement {
  if (!rect) return 'bottom-left'
  const vw = window.innerWidth
  const vh = window.innerHeight
  const M = 16
  const target = {
    left: rect.left - M,
    top: rect.top - M,
    right: rect.left + rect.width + M,
    bottom: rect.top + rect.height + M,
  }
  const boxFor = (p: Placement) => {
    const left = p.includes('right') ? vw - cluster.w - M : M
    const top = p.includes('top') ? M : vh - cluster.h - M
    return { left, top, right: left + cluster.w, bottom: top + cluster.h }
  }
  const overlapArea = (a: typeof target, b: typeof target) =>
    Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
    Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))

  let best: Placement = 'bottom-left'
  let bestArea = Infinity
  for (const p of PLACEMENTS) {
    const area = overlapArea(boxFor(p), target)
    if (area === 0) return p
    if (area < bestArea) {
      bestArea = area
      best = p
    }
  }
  return best
}

export function PokedexTour({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [index, setIndex] = useState(0)
  const [rect, setRect] = useState<SpotRect | null>(null)
  const [placement, setPlacement] = useState<Placement>('bottom-left')
  const bubbleRef = useRef<HTMLDivElement>(null)
  const clusterRef = useRef<HTMLDivElement>(null)
  const primaryRef = useRef<HTMLButtonElement>(null)

  const step = STEPS[index]
  const isFirst = index === 0
  const isLast = index === STEPS.length - 1

  // Restart from the top each time the tour is (re)opened.
  useEffect(() => {
    if (open) setIndex(0)
  }, [open])

  const measure = useCallback(() => {
    const selector = STEPS[index]?.selector
    let next: SpotRect | null = null
    if (selector) {
      const el = document.querySelector(selector)
      if (el) {
        const r = el.getBoundingClientRect()
        next = { top: r.top, left: r.left, width: r.width, height: r.height }
      }
    }
    setRect(next)
    const cluster = clusterRef.current?.getBoundingClientRect()
    setPlacement(
      pickPlacement(next, { w: cluster?.width ?? 460, h: cluster?.height ?? 240 }),
    )
  }, [index])

  // On each step, scroll the target into view (instantly, to avoid a race with
  // measuring) then place the spotlight over it.
  useLayoutEffect(() => {
    if (!open) return
    const selector = STEPS[index]?.selector
    if (selector) {
      document
        .querySelector(selector)
        ?.scrollIntoView({ block: 'center', inline: 'center' })
    }
    measure()
    const raf = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(raf)
  }, [open, index, measure])

  // Keep the spotlight glued to the target as the device scrolls or resizes.
  useEffect(() => {
    if (!open) return
    const onMove = () => measure()
    window.addEventListener('scroll', onMove, true)
    window.addEventListener('resize', onMove)
    return () => {
      window.removeEventListener('scroll', onMove, true)
      window.removeEventListener('resize', onMove)
    }
  }, [open, measure])

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, STEPS.length - 1)), [])
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), [])

  // Own the keyboard while open (capture phase) so the underlying modal's
  // Escape/Tab handlers don't fight the tour. Arrows/Enter page; Tab cycles the
  // bubble's own buttons; Escape ends the tour (leaving the Pokédex open).
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        if (isLast) onClose()
        else next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        e.stopPropagation()
        prev()
      } else if (e.key === 'Tab') {
        const items = Array.from(
          bubbleRef.current?.querySelectorAll<HTMLElement>('button') ?? [],
        )
        if (items.length === 0) return
        e.preventDefault()
        e.stopPropagation()
        const current = items.indexOf(document.activeElement as HTMLElement)
        const delta = e.shiftKey ? -1 : 1
        const nextEl = items[(current + delta + items.length) % items.length]
        nextEl?.focus()
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [open, isLast, next, prev, onClose])

  // Move focus onto the primary action as each step appears.
  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => primaryRef.current?.focus(), 40)
    return () => window.clearTimeout(t)
  }, [open, index])

  if (!open) return null

  const spot = rect
    ? {
        top: rect.top - PAD,
        left: rect.left - PAD,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
      }
    : null

  const isTop = placement.includes('top')
  const isRight = placement.includes('right')
  const anchorStyle: CSSProperties = {
    position: 'fixed',
    top: isTop ? 0 : undefined,
    bottom: isTop ? undefined : 0,
    left: isRight ? undefined : 0,
    right: isRight ? 0 : undefined,
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-label="Pokédex guided tour"
      // Portaled into <body>, but React events still bubble up the component
      // tree to the modal backdrop — isolate clicks/animations so the tour can't
      // trip the modal's close-on-backdrop or close-on-animation-end handlers.
      onClick={(e) => e.stopPropagation()}
      onAnimationEnd={(e) => e.stopPropagation()}
    >
      {/* Dim + spotlight. The huge box-shadow darkens everything except the
          highlighted element; a full dark layer is used for intro/outro. */}
      {spot ? (
        <div
          className="pointer-events-none absolute rounded-2xl ring-[3px] ring-white/90 transition-all duration-300 ease-[var(--ease-smooth)]"
          style={{
            top: spot.top,
            left: spot.left,
            width: spot.width,
            height: spot.height,
            boxShadow: '0 0 0 9999px rgba(6, 8, 14, 0.8)',
          }}
        />
      ) : (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'rgba(6, 8, 14, 0.84)' }}
        />
      )}

      {/* Click-catcher: blocks interaction with the Pokédex beneath the tour. */}
      <div className="absolute inset-0" aria-hidden="true" />

      {/* Ash + speech bubble — anchored to whichever corner keeps the
          highlighted element clear (see pickPlacement). */}
      <div
        ref={clusterRef}
        style={anchorStyle}
        className={`tour-cluster pointer-events-none z-[101] flex max-w-[calc(100vw-1rem)] gap-2 p-3 sm:gap-3 sm:p-5 ${
          isTop ? 'items-start' : 'items-end'
        }`}
      >
        <img
          src="/ash.webp"
          alt=""
          draggable={false}
          className="tour-ash h-28 w-auto shrink-0 select-none drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)] sm:h-44"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />

        <div
          ref={bubbleRef}
          className="tour-bubble pointer-events-auto relative w-full max-w-sm rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-lg)] sm:p-5"
        >
          {/* Little tail pointing at Ash */}
          <span
            aria-hidden="true"
            className={`absolute -left-2 h-4 w-4 rotate-45 border-b border-l border-border bg-surface ${
              isTop ? 'top-6' : 'bottom-6'
            }`}
          />

          <div className="flex items-center justify-between gap-2">
            <span className="tabular text-xs font-bold uppercase tracking-wider text-primary">
              Step {index + 1} / {STEPS.length}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="End tour"
              className="grid h-7 w-7 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <X className="h-4 w-4" strokeWidth={2.4} />
            </button>
          </div>

          <h3 className="mt-1.5 text-lg font-black tracking-tight text-ink">{step.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.body}</p>

          {/* Progress dots */}
          <div className="mt-3 flex items-center gap-1.5" aria-hidden="true">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? 'w-4 bg-primary' : 'w-1.5 bg-border-strong'
                }`}
              />
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-semibold text-muted transition-colors hover:text-ink"
            >
              Skip
            </button>
            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  type="button"
                  onClick={prev}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-ink-soft transition-colors hover:border-border-strong hover:text-ink"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={2.4} />
                  Back
                </button>
              )}
              <button
                ref={primaryRef}
                type="button"
                onClick={isLast ? onClose : next}
                className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-ink shadow-[var(--shadow-sm)] transition-transform active:scale-95"
              >
                {isLast ? 'Done' : 'Next'}
                {!isLast && <ChevronRight className="h-4 w-4" strokeWidth={2.4} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
