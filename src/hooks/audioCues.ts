import Tts from 'react-native-tts'

interface IAudioCuesApi {
  speak: (text: string) => void
}

export interface AudioCuesPreferences {
  enabled: boolean
}

export function useAudioCues(): IAudioCuesApi {
  function speak(text: string) {
    Tts.speak(text)
  }

  return { speak }
}
