import { Route, Routes } from 'react-router-dom'
import { useThemeEffect } from '@/hooks/useThemeEffect'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { CompareTray } from '@/components/compare/CompareTray'
import { Home } from '@/pages/Home'
import { PokemonDetail } from '@/pages/PokemonDetail'
import { NotFound } from '@/pages/NotFound'

export default function App() {
  useThemeEffect()

  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollToTop />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pokemon/:name" element={<PokemonDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <CompareTray />
    </div>
  )
}
