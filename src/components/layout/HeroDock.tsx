import { useNavigate } from 'react-router-dom'
import { Heart, Moon, Sun, Swords } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { AnimatedDock } from '@/components/ui/animated-dock'
import { PokeballIcon } from '@/components/ui/PokeballIcon'

interface HeroDockProps {
  favoritesOnly: boolean
  onToggleFavorites: () => void
}

const ICON = 22

/**
 * The hero's magnifying dock — Explore (jump to the grid), Battle (the
 * Battlefield page), Favourites (toggle the filter) and Theme (light/dark).
 */
export function HeroDock({ favoritesOnly, onToggleFavorites }: HeroDockProps) {
  const navigate = useNavigate()
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const isDark = theme === 'dark'

  const scrollToGrid = () =>
    document.getElementById('pokedex-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <AnimatedDock
      items={[
        { label: 'Explore', Icon: <PokeballIcon size={ICON} className="drop-shadow-sm" />, onClick: scrollToGrid },
        { label: 'Battle', Icon: <Swords size={ICON} />, onClick: () => navigate('/battlefield') },
        {
          label: favoritesOnly ? 'Show all Pokémon' : 'Favourites only',
          Icon: <Heart size={ICON} fill={favoritesOnly ? 'currentColor' : 'none'} />,
          onClick: onToggleFavorites,
        },
        {
          label: isDark ? 'Switch to light mode' : 'Switch to dark mode',
          Icon: isDark ? <Sun size={ICON} /> : <Moon size={ICON} />,
          onClick: toggleTheme,
        },
      ]}
    />
  )
}
