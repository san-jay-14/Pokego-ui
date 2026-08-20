import type { PokemonSpecies } from '@/types/pokemon'
import { formatFormLabel } from '@/utils/species'

interface FormSelectorProps {
  species: PokemonSpecies | undefined
  baseName: string
  formName: string
  onFormSelect: (name: string) => void
}

/** Pill-shaped form switcher — a 2-column grid of glossy stadium buttons. */
export function FormSelector({ species, baseName, formName, onFormSelect }: FormSelectorProps) {
  const forms = species?.varieties ?? []
  if (forms.length === 0) return null

  return (
    <div
      className="no-scrollbar grid max-h-[110px] grid-cols-2 content-start gap-1.5 overflow-y-auto sm:max-h-[130px]"
      style={{ fontFamily: 'var(--font-lcd)' }}
    >
      {forms.map((v) => {
        const selected = v.pokemon.name === formName
        return (
          <button
            key={v.pokemon.name}
            type="button"
            onClick={() => onFormSelect(v.pokemon.name)}
            aria-pressed={selected}
            className={`truncate rounded-full px-2 py-1 text-[0.7rem] font-bold uppercase tracking-wide transition-transform active:scale-95 ${
              selected ? 'text-white' : 'text-white/75'
            }`}
            style={{
              background: selected
                ? 'linear-gradient(160deg, #6fc3ff 0%, #2a7fd4 55%, #0d4a8f 100%)'
                : 'linear-gradient(160deg, #9c2226 0%, #6c1013 55%, #4a0c0e 100%)',
              boxShadow: selected
                ? 'inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -2px 3px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.4)'
                : 'inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -2px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.4)',
            }}
          >
            {formatFormLabel(v.pokemon.name, baseName)}
          </button>
        )
      })}
    </div>
  )
}
