import { Route, Routes } from 'react-router-dom'
import { useThemeEffect } from '@/hooks/useThemeEffect'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { CompareTray } from '@/components/compare/CompareTray'
import { Home } from '@/pages/Home'
import { PokedexModal } from '@/components/pokemon/detail/PokedexModal'
import { Battlefield } from '@/pages/Battlefield'
import { NotFound } from '@/pages/NotFound'

export default function App() {
  useThemeEffect()

  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollToTop />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />}>
            {/* The detail view is a modal over the grid — Home stays mounted
                underneath so the URL, deep links and refreshes all resolve to
                the grid with the Pokédex open on top. */}
            <Route path="pokemon/:name" element={<PokedexModal />} />
          </Route>
          <Route path="/battlefield" element={<Battlefield />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <CompareTray />
    </div>
  )
}
