import { useEffect } from 'react'
import Tts from 'react-native-tts'

interface IAudioCuesApi {
  speak(text: string): void
}

export default function useAudioCues(): IAudioCuesApi {
  function speak(text: string) {
    Tts.speak(text)
  }

  return { speak }
}
