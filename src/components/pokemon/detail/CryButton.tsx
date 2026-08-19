import { useRef, useState } from 'react'
import { Volume2 } from 'lucide-react'

interface CryButtonProps {
  src: string
  name: string
}

/** Plays a Pokémon's cry (audio from the API). Sits in the detail hero. */
export function CryButton({ src, name }: CryButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  const play = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src)
      audioRef.current.volume = 0.4
      audioRef.current.addEventListener('ended', () => setPlaying(false))
    }
    audioRef.current.currentTime = 0
    void audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }

  return (
    <button
      type="button"
      onClick={play}
      aria-label={`Play ${name}'s cry`}
      className={`grid h-11 w-11 place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30 ${
        playing ? 'animate-pulse' : ''
      }`}
    >
      <Volume2 className="h-5 w-5" strokeWidth={2.2} />
    </button>
  )
}
