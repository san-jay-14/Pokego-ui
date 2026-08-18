import { CloudOff, RefreshCw, SearchX, ServerCrash } from 'lucide-react'
import { ApiError } from '@/services/pokemonApi'
import { Button } from '@/components/ui/Button'

interface ErrorStateProps {
  error?: unknown
  onRetry?: () => void
  className?: string
}

interface ErrorCopy {
  icon: typeof CloudOff
  title: string
  body: string
  retryable: boolean
}

/** Map any thrown error to clear, user-facing copy (no stack traces, no jargon). */
function resolveCopy(error?: unknown): ErrorCopy {
  if (error instanceof ApiError) {
    switch (error.kind) {
      case 'not-found':
        return {
          icon: SearchX,
          title: 'Pokémon not found',
          body: 'We couldn’t find that Pokémon. Try searching for another one.',
          retryable: false,
        }
      case 'network':
        return {
          icon: CloudOff,
          title: 'You’re offline',
          body: 'We couldn’t reach the Pokédex. Check your connection and try again.',
          retryable: true,
        }
      case 'malformed':
        return {
          icon: ServerCrash,
          title: 'Something looks off',
          body: 'The Pokédex sent back an unexpected response. Give it another try.',
          retryable: true,
        }
      default:
        break
    }
  }
  return {
    icon: ServerCrash,
    title: 'Something went wrong',
    body: 'We couldn’t load the Pokémon. Please try again.',
    retryable: true,
  }
}

/** Reusable, centred error panel with an optional retry action. */
export function ErrorState({ error, onRetry, className = '' }: ErrorStateProps) {
  const copy = resolveCopy(error)
  const Icon = copy.icon

  return (
    <div
      role="alert"
      className={`animate-float-in mx-auto flex max-w-sm flex-col items-center px-6 py-16 text-center ${className}`}
    >
      <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-danger/10 text-danger">
        <Icon className="h-8 w-8" strokeWidth={1.75} />
      </div>
      <h2 className="text-xl font-bold text-ink">{copy.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{copy.body}</p>
      {copy.retryable && onRetry && (
        <Button variant="primary" onClick={onRetry} className="mt-6">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  )
}
