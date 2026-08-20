import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AnimationEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Pokemon } from '@/types/pokemon'
import {
  useAbilityDetails,
  useEncounters,
  useEvolutionChain,
  usePokemonDetail,
  usePokemonSpecies,
  useTypeEffectiveness,
} from '@/hooks/usePokemonData'
import { getTypeConfig } from '@/constants/pokemonTypes'
import { primaryType } from '@/utils/pokemon'
import { ErrorState } from '@/components/states/ErrorState'
import { PokeballSpinner } from '@/components/ui/PokeballSpinner'
import { ApiError } from '@/services/pokemonApi'
import { Pokedex } from './Pokedex'

/**
 * The Pokédex opened as a book: a fixed overlay above the grid that swings
 * open on mount and swings shut before it navigates home. The URL still moves
 * to /pokemon/:name — this simply *is* the destination now (no standalone
 * page), so deep links and refreshes land back on the grid with the device
 * already open.
 */
export function PokedexModal() {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const [closing, setClosing] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setClosing(true), [])

  // Escape to close, lock background scroll, and keep keyboard focus inside the
  // dialog (trap Tab), restoring focus to the element that opened it on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const stage = stageRef.current

    const focusables = () =>
      Array.from(
        stage?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setClosing(true)
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const activeEl = document.activeElement as HTMLElement | null
      if (e.shiftKey && activeEl === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault()
        first.focus()
      } else if (activeEl && !stage?.contains(activeEl)) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Move focus into the dialog. Content loads async (a spinner shows first),
    // so focus the container itself — Tab then reaches the close control once
    // the device has rendered. A short timeout lets the first paint settle.
    const focusTimer = window.setTimeout(() => (focusables()[0] ?? stage)?.focus(), 60)

    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      // Only hand focus back to the opener if focus is still inside the dialog,
      // so we restore on a real close but never yank it during React's
      // dev-mode remount (which briefly unmounts while focus is elsewhere).
      if (opener && opener.isConnected && stage?.contains(document.activeElement)) {
        opener.focus()
      }
    }
  }, [])

  // The swing-close animation finishing is our cue to actually leave. Matching
  // target === currentTarget ignores child animations (pop-in, float-in) that
  // bubble up, and works regardless of the close keyframe name (reduced-motion).
  const onSwingEnd = (e: AnimationEvent<HTMLDivElement>) => {
    if (closing && e.target === e.currentTarget) navigate('/')
  }

  return (
    <div
      className="pokedex-modal-backdrop"
      data-closing={closing || undefined}
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Pokédex entry"
    >
      <div className="pokedex-modal-stage outline-none" ref={stageRef} tabIndex={-1}>
        <div
          className="pokedex-swing"
          data-closing={closing || undefined}
          onClick={(e) => e.stopPropagation()}
          onAnimationEnd={onSwingEnd}
        >
          <ModalBody name={name} onClose={close} />
        </div>
      </div>
    </div>
  )
}

/** Gate on the base Pokémon load; everything past it fetches progressively. */
function ModalBody({ name, onClose }: { name: string | undefined; onClose: () => void }) {
  const { data, isLoading, isError, error, refetch } = usePokemonDetail(name)

  if (isLoading) {
    return (
      <section className="pokedex-shell mx-auto flex min-h-[420px] w-full max-w-[1000px] items-center justify-center rounded-[var(--radius-card)] p-3 sm:p-4">
        <PokeballSpinner size={48} />
      </section>
    )
  }

  if (isError || !data) {
    const notFound = error instanceof ApiError && error.kind === 'not-found'
    return (
      <section className="pokedex-shell mx-auto flex min-h-[360px] w-full max-w-[1000px] items-center justify-center rounded-[var(--radius-card)] p-4">
        <ErrorState error={error} onRetry={notFound ? undefined : () => refetch()} />
      </section>
    )
  }

  return <DetailContent key={data.id} base={data} onClose={onClose} />
}

/** Wires the live Pokémon data into the device. Keyed by id so switching the
 *  base Pokémon (prev/next, evolution links) resets the selected form. */
function DetailContent({ base, onClose }: { base: Pokemon; onClose: () => void }) {
  const [formName, setFormName] = useState(base.name)

  const species = usePokemonSpecies(base.id)
  const formQuery = usePokemonDetail(formName)
  const active = formQuery.data ?? base // the currently-selected form

  const cfg = getTypeConfig(primaryType(active))
  const evolution = useEvolutionChain(species.data?.evolution_chain.url)

  const typeNames = useMemo(() => active.types.map((t) => t.type.name), [active])
  const effectiveness = useTypeEffectiveness(typeNames)

  const abilityNames = useMemo(() => active.abilities.map((a) => a.ability.name), [active])
  const abilities = useAbilityDetails(abilityNames)

  const encounters = useEncounters(active.id)

  return (
    <Pokedex
      base={base}
      active={active}
      species={species.data}
      speciesLoading={species.isLoading}
      accent={cfg.color}
      effectiveness={effectiveness.data}
      effectivenessLoading={effectiveness.isLoading}
      abilityDetails={abilities.byName}
      encounters={encounters.data}
      encountersLoading={encounters.isLoading}
      evolution={evolution.data}
      evolutionLoading={evolution.isLoading}
      formName={formName}
      onFormSelect={setFormName}
      onClose={onClose}
    />
  )
}
