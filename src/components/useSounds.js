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

  const unlock = useCallback(() => {
    ;[alarm, click, success, toggle].forEach((ref) => {
      try {
        const audio = ref.current
        const previousVolume = audio.volume
        audio.volume = 0
        audio.currentTime = 0
        const attempt = audio.play()
        if (attempt?.then) {
          attempt
            .then(() => {
              audio.pause()
              audio.currentTime = 0
              audio.volume = previousVolume
            })
            .catch(() => {
              audio.volume = previousVolume
            })
        } else {
          audio.pause()
          audio.currentTime = 0
          audio.volume = previousVolume
        }
      } catch {
        // Some browsers only allow this after a user gesture.
      }
    })
  }, [])

  const playAlarm = useCallback(() => play(alarm), [play])
  const playClick = useCallback(() => play(click), [play])
  const playSuccess = useCallback(() => play(success), [play])
  const playToggle = useCallback(() => play(toggle), [play])

  return {
    playAlarm,
    playClick,
    playSuccess,
    playToggle,
    unlockSounds: unlock,
  }
}
