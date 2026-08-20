import { useRef, useState } from 'react'
import { Volume2 } from 'lucide-react'

interface DeviceCryProps {
  src: string
  name: string
}

/** Plays a Pokémon's cry — the device's "speaker" button. */
export function DeviceCry({ src, name }: DeviceCryProps) {
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
      className={`grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-white/15 hover:text-white ${
        playing ? 'animate-pulse' : ''
      }`}
    >
      <Volume2 className="h-5 w-5" strokeWidth={2.2} />
    </button>
  )
}
