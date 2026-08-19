import { useState } from 'react'
import { Images, Sparkles } from 'lucide-react'
import type { Pokemon } from '@/types/pokemon'
import { SectionCard } from './Section'

interface SpriteGalleryProps {
  pokemon: Pokemon
}

interface SpriteEntry {
  label: string
  normal: string | null | undefined
  shiny?: string | null | undefined
}

/** Sprite showcase with a shiny toggle — pulls every sprite the API provides. */
export function SpriteGallery({ pokemon }: SpriteGalleryProps) {
  const [shiny, setShiny] = useState(false)
  const s = pokemon.sprites
  const oa = s.other?.['official-artwork']

  const entries: SpriteEntry[] = [
    { label: 'Artwork', normal: oa?.front_default, shiny: oa?.front_shiny },
    { label: 'Home', normal: s.other?.home?.front_default, shiny: s.other?.home?.front_shiny },
    { label: 'Animated', normal: s.other?.showdown?.front_default },
    { label: 'Front', normal: s.front_default, shiny: s.front_shiny },
    { label: 'Back', normal: s.back_default, shiny: s.back_shiny },
  ]

  const visible = entries.filter((e) => (shiny ? (e.shiny ?? e.normal) : e.normal))
  const canShiny = entries.some((e) => e.shiny)

  return (
    <SectionCard
      title="Sprites"
      icon={<Images className="h-4 w-4" />}
      subtitle={
        canShiny ? (
          <button
            type="button"
            onClick={() => setShiny((v) => !v)}
            aria-pressed={shiny}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
              shiny ? 'border-transparent bg-warning/15 text-warning' : 'border-border text-muted hover:text-ink'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Shiny
          </button>
        ) : undefined
      }
    >
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {visible.map((e) => (
          <div key={e.label} className="flex flex-col items-center gap-1.5">
            <div className="grid aspect-square w-full place-items-center rounded-xl border border-border bg-surface-2 p-2">
              <img
                src={(shiny ? (e.shiny ?? e.normal) : e.normal) ?? undefined}
                alt={`${pokemon.name} ${e.label}${shiny ? ' shiny' : ''}`}
                loading="lazy"
                className="h-full w-full object-contain"
                style={{ imageRendering: e.label === 'Front' || e.label === 'Back' ? 'pixelated' : 'auto' }}
                draggable={false}
              />
            </div>
            <span className="text-xs font-medium text-muted">{e.label}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
