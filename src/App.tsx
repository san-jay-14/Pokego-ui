import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useThemeEffect } from '@/hooks/useThemeEffect'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { CompareTray } from '@/components/compare/CompareTray'
import { Home } from '@/pages/Home'
import { PokeballSpinner } from '@/components/ui/PokeballSpinner'

// Split the two heaviest, non-initial views into their own chunks so the home
// grid ships a smaller entry bundle. The Pokédex device (modal) and the
// Battlefield only load when their route is actually visited.
const PokedexModal = lazy(() =>
  import('@/components/pokemon/detail/PokedexModal').then((m) => ({ default: m.PokedexModal })),
)
const Battlefield = lazy(() =>
  import('@/pages/Battlefield').then((m) => ({ default: m.Battlefield })),
)
const NotFound = lazy(() =>
  import('@/pages/NotFound').then((m) => ({ default: m.NotFound })),
)

/** Full-viewport spinner shown while a route chunk is fetched. */
function RouteFallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <PokeballSpinner size={44} />
    </div>
  )
}

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
                the grid with the Pokédex open on top. It swings in once its
                chunk resolves; the modal renders its own loading spinner. */}
            <Route
              path="pokemon/:name"
              element={
                <Suspense fallback={null}>
                  <PokedexModal />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/battlefield"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Battlefield />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={<RouteFallback />}>
                <NotFound />
              </Suspense>
            }
          />
        </Routes>
      </main>
      <CompareTray />
    </div>
  )
}
