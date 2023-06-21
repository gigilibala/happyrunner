import Tts from 'react-native-tts'

interface IAudioCuesApi {
  speak: (text: string) => void
}

export interface AudioCuesPreferences {
  enabled: boolean
  triggerTime: boolean
  triggerTimeSeconds: number
  triggerDistance: boolean
  triggerDistanceMeters: number
}

export const DefaultAudioCuesPreferences: AudioCuesPreferences = {
  enabled: true,
  triggerTime: true,
  triggerTimeSeconds: 30,
  triggerDistance: false,
  triggerDistanceMeters: 1000,
}

export function useAudioCues(): IAudioCuesApi {
  function speak(text: string) {
    Tts.speak(text)
  }
  return { speak }
}
