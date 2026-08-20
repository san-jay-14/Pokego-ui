import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

interface TriggerArgs {
  toggle: () => void
  open: boolean
  triggerRef: (el: HTMLElement | null) => void
}

interface DropdownProps {
  /** Renders the trigger element; spread `triggerRef` onto it and call `toggle` to open. */
  renderTrigger: (args: TriggerArgs) => ReactNode
  /** Panel content; call `close` after a selection. */
  children: (close: () => void) => ReactNode
  /** Anchor the panel's start (left) or end (right) edge to the trigger. */
  align?: 'start' | 'end'
  /** Accessible label for the listbox panel. */
  label?: string
  /** Extra classes for the floating panel. */
  panelClassName?: string
}

/**
 * A small, accessible popover primitive. The panel renders through a portal so
 * it's never clipped by an ancestor's `overflow-hidden`, and it repositions on
 * scroll/resize. Closes on outside-click and Escape; focus moves into the panel
 * on open and back to the trigger on Escape.
 */
export function Dropdown({
  renderTrigger,
  children,
  align = 'start',
  label,
  panelClassName = '',
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  const setTriggerRef = useCallback((el: HTMLElement | null) => {
    triggerRef.current = el
  }, [])

  const measure = useCallback(() => {
    if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect())
  }, [])

  const toggle = useCallback(() => {
    setOpen((o) => {
      if (!o) measure()
      return !o
    })
  }, [measure])

  const close = useCallback(() => setOpen(false), [])

  // Keep the panel glued to the trigger while open.
  useLayoutEffect(() => {
    if (!open) return
    measure()
    const onMove = () => measure()
    window.addEventListener('scroll', onMove, true)
    window.addEventListener('resize', onMove)
    return () => {
      window.removeEventListener('scroll', onMove, true)
      window.removeEventListener('resize', onMove)
    }
  }, [open, measure])

  // Outside-click + Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Move focus into the panel (selected option first) when it opens.
  useEffect(() => {
    if (!open || !panelRef.current) return
    const target =
      panelRef.current.querySelector<HTMLElement>('[aria-selected="true"]') ??
      panelRef.current.querySelector<HTMLElement>('button, [tabindex]')
    target?.focus()
  }, [open])

  const style: CSSProperties = rect
    ? {
        position: 'fixed',
        top: rect.bottom + 8,
        ...(align === 'end'
          ? { right: Math.max(8, window.innerWidth - rect.right) }
          : { left: Math.max(8, rect.left) }),
        zIndex: 60,
      }
    : {}

  return (
    <>
      {renderTrigger({ toggle, open, triggerRef: setTriggerRef })}
      {open &&
        rect &&
        createPortal(
          <div
            ref={panelRef}
            role="listbox"
            aria-label={label}
            style={style}
            className={`animate-dropdown rounded-[var(--radius-control)] border border-border bg-surface p-1.5 shadow-[var(--shadow-lg)] ${panelClassName}`}
          >
            {children(close)}
          </div>,
          document.body,
        )}
    </>
  )
}
