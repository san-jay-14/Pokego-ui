import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { EmptyState } from '@/components/states/EmptyState'
import { Button } from '@/components/ui/Button'

export function NotFound() {
  const navigate = useNavigate()
  return (
    <PageContainer className="py-16">
      <EmptyState
        icon={<Compass className="h-8 w-8" strokeWidth={1.75} />}
        title="Page not found"
        body="That route doesn’t exist. Let’s get you back to the Pokédex."
        action={<Button variant="primary" onClick={() => navigate('/')}>Back to Pokédex</Button>}
      />
    </PageContainer>
  )
}
