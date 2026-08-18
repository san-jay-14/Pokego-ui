import { Heart } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

interface FavoriteButtonProps {
  id: number
  name: string
  size?: 'sm' | 'md'
  className?: string
}

/** Toggles a Pokémon's favourite state (persisted in localStorage via the store). */
export function FavoriteButton({ id, name, size = 'sm', className = '' }: FavoriteButtonProps) {
  const isFavorite = useAppStore((s) => s.favorites.includes(id))
  const toggleFavorite = useAppStore((s) => s.toggleFavorite)

  const box = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11'
  const icon = size === 'sm' ? 'h-[18px] w-[18px]' : 'h-5 w-5'

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(id)
      }}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? `Remove ${name} from favourites` : `Add ${name} to favourites`}
      className={`grid place-items-center rounded-full border backdrop-blur-sm transition-all duration-200 active:scale-90 ${box} ${
        isFavorite
          ? 'border-transparent bg-danger/15 text-danger'
          : 'border-border bg-surface/70 text-muted hover:text-danger hover:border-danger/40'
      } ${className}`}
    >
      <Heart className={icon} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2.2} />
    </button>
  )
}
