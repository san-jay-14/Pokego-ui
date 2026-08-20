import { useMemo, useState } from 'react'
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
import { PageContainer } from '@/components/layout/PageContainer'
import { DetailSkeleton } from '@/components/states/DetailSkeleton'
import { ErrorState } from '@/components/states/ErrorState'
import { Button } from '@/components/ui/Button'
import { ApiError } from '@/services/pokemonApi'
import { Pokedex } from '@/components/pokemon/detail/Pokedex'

export function PokemonDetail() {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError, error, refetch } = usePokemonDetail(name)

  return (
    <PageContainer className="py-3 sm:py-4">
      {isLoading && <DetailSkeleton />}

      {isError && !isLoading && (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface">
          <ErrorState
            error={error}
            onRetry={error instanceof ApiError && error.kind === 'not-found' ? undefined : () => refetch()}
          />
          {error instanceof ApiError && error.kind === 'not-found' && (
            <div className="flex justify-center pb-12">
              <Button variant="primary" onClick={() => navigate('/')}>
                Back to Pokédex
              </Button>
            </div>
          )}
        </div>
      )}

      {data && !isLoading && <DetailContent key={data.id} base={data} />}
    </PageContainer>
  )
}

function DetailContent({ base }: { base: Pokemon }) {
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
    <article className="animate-float-in">
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
      />
    </article>
  )
}
