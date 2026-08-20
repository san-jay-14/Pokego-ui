import { useMemo, useState } from 'react'
import { RotateCw, Sparkles } from 'lucide-react'
import type { Pokemon } from '@/types/pokemon'
import { formatName, getArtwork } from '@/utils/pokemon'
import { useHoloPointer } from '@/hooks/useHoloPointer'

interface SpriteViewerProps {
  pokemon: Pokemon
  /** Ghosted dex numeral shown behind the artwork. */
  dexId: number
  /** Turns on the holo sheen for Legendary / Mythical entries. */
  holo?: boolean
}

interface SpriteView {
  key: string
  label: string
  normal: string | null | undefined
  shiny?: string | null | undefined
  pixel?: boolean
}

/**
 * The device's main screen: a silver-bezelled glossy blue viewport for the
 * featured creature, with red sensor dots, a rotate button, a shiny toggle
 * button, and a pointer-tracked holo sheen for rare Pokémon.
 */
export function SpriteViewer({ pokemon, dexId, holo = false }: SpriteViewerProps) {
  const [shiny, setShiny] = useState(false)
  const [viewKey, setViewKey] = useState('animated')
  const holoState = useHoloPointer()

  const s = pokemon.sprites
  const oa = s.other?.['official-artwork']

  const views = useMemo<SpriteView[]>(() => {
    const all: SpriteView[] = [
      { key: 'artwork', label: 'Artwork', normal: oa?.front_default ?? getArtwork(pokemon), shiny: oa?.front_shiny },
      { key: 'home', label: 'Home', normal: s.other?.home?.front_default, shiny: s.other?.home?.front_shiny },
      { key: 'animated', label: 'Animated', normal: s.other?.showdown?.front_default, pixel: true },
      { key: 'front', label: 'Front', normal: s.front_default, shiny: s.front_shiny, pixel: true },
      { key: 'back', label: 'Back', normal: s.back_default, shiny: s.back_shiny, pixel: true },
    ]
    return all.filter((v) => v.normal)
  }, [oa, s, pokemon])

  // The bottom strip skips the animated sprite — it stays a rotate-only view on the main screen.
  const stripViews = useMemo(() => views.filter((v) => v.key !== 'animated'), [views])

  const active = views.find((v) => v.key === viewKey) ?? views[0]
  const canShiny = views.some((v) => v.shiny)
  const src = (shiny ? active?.shiny ?? active?.normal : active?.normal) ?? undefined

  const cycleView = () => {
    const i = views.findIndex((v) => v.key === active?.key)
    setViewKey(views[(i + 1) % views.length]?.key ?? viewKey)
  }

  return (
    <div className="device-bezel flex w-full flex-col gap-1.5 rounded-2xl p-2">
      {/* Sensor dots above the screen */}
      <div className="flex items-center justify-center gap-3" aria-hidden="true">
        <span className="device-dot h-1.5 w-1.5 rounded-full" />
        <span className="device-dot h-1.5 w-1.5 rounded-full" />
      </div>

      {/* Main screen + vertical sprite strip fused into one continuous surface */}
      <div className="flex h-[240px] sm:h-[270px] lg:h-[300px]">
        <div
          className="device-screen-blue relative flex-1 rounded-l-xl"
          onPointerMove={holo ? holoState.onPointerMove : undefined}
          onPointerLeave={holo ? holoState.onPointerLeave : undefined}
        >
          {/* Ghosted dex numeral behind the sprite */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 grid place-items-center text-[5rem] font-bold leading-none text-white/10 sm:text-[6rem]"
            style={{ fontFamily: 'var(--font-lcd)' }}
          >
            {String(dexId).padStart(3, '0')}
          </span>

          <div
            className="absolute inset-0 grid place-items-center p-4"
            style={holo ? holoState.style : undefined}
          >
            <div className="relative flex h-full w-full items-center justify-center">
              <div className="relative z-10 h-[65%] w-[65%] -translate-y-[24%]">
                <img
                  key={src}
                  src={src}
                  alt={`${formatName(pokemon.name)} — ${active?.label ?? 'artwork'}${shiny ? ' shiny' : ''}`}
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = '/pokeball.svg'
                    e.currentTarget.classList.add('opacity-30')
                  }}
                  className="animate-pop-in h-full w-full object-contain drop-shadow-[0_10px_14px_rgba(8,36,74,0.5)]"
                  style={{ imageRendering: active?.pixel ? 'pixelated' : 'auto' }}
                  draggable={false}
                />
              </div>
              {/* Contact-shadow ellipse beneath the sprite */}
              <span
                aria-hidden="true"
                className="absolute bottom-[28%] left-1/2 h-[10%] w-[46%] -translate-x-1/2 rounded-[50%] bg-black/25 blur-[4px]"
              />
            </div>
          </div>

          {holo && (
            <>
              <div className="tcg-holo rounded-l-xl" style={{ opacity: holoState.active ? 0.5 : 0 }} />
              <div className="tcg-glare rounded-l-xl" style={{ opacity: holoState.active ? 1 : 0 }} />
            </>
          )}
        </div>

        {/* Sprite strip — every remaining variant stacked vertically beside the main screen */}
        <div className="device-screen-blue flex w-16 flex-col overflow-hidden rounded-r-xl sm:w-20">
          {stripViews.map((v) => {
            const thumb = (shiny ? v.shiny ?? v.normal : v.normal) ?? undefined
            return (
              <div
                key={v.key}
                className="flex min-h-0 flex-1 items-center justify-center border-b border-white/25 p-1 last:border-b-0"
              >
                <img
                  src={thumb}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className={`h-full w-full object-contain ${v.pixel ? 'scale-125' : ''}`}
                  style={{ imageRendering: v.pixel ? 'pixelated' : 'auto' }}
                  draggable={false}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Red button (rotate view) + shiny toggle + speaker grille */}
      <div className="flex items-center gap-2 px-1">
        <button
          type="button"
          onClick={cycleView}
          aria-label="Rotate sprite view"
          className="device-red-btn grid h-6 w-6 shrink-0 place-items-center rounded-full text-white/90 transition-transform active:scale-90"
        >
          <RotateCw className="h-3.5 w-3.5" strokeWidth={2.6} />
        </button>
        {canShiny && (
          <button
            type="button"
            onClick={() => setShiny((v) => !v)}
            aria-pressed={shiny}
            aria-label="Toggle shiny"
            className={`grid h-6 w-6 shrink-0 place-items-center rounded-full transition-all active:scale-90 ${
              shiny
                ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-[#5a3a00] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_1px_3px_rgba(0,0,0,0.4)]'
                : 'device-red-btn text-white/90'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
          </button>
        )}
        <span
          className={`h-3 flex-1 rounded-sm transition-colors ${shiny ? 'device-grille-active' : 'device-grille'}`}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
