import { useRef, useCallback } from 'react'

function makeAudio(src) {
  const audio = new Audio(src)
  audio.preload = 'auto'
  return audio
}

export function useSounds() {
  // Refs so we never recreate Audio objects on re-renders
  const alarm   = useRef(makeAudio('/alarm_sound.wav'))
  const click   = useRef(makeAudio('/click.wav'))
  const success = useRef(makeAudio('/success.mp3'))
  const toggle  = useRef(makeAudio('/toggle.wav'))

  const play = useCallback((ref) => {
    try {
      // Rewind so rapid calls always trigger from the start
      ref.current.currentTime = 0
      ref.current.play().catch(() => {
        // Autoplay blocked by browser — ignore silently
      })
    } catch {
      // Missing file or unsupported format — ignore silently
    }
  }, [])

  return {
    playAlarm:   () => play(alarm),
    playClick:   () => play(click),
    playSuccess: () => play(success),
    playToggle:  () => play(toggle),
  }
}