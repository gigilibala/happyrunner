import { createContext, ReactNode } from 'react'
import Tts from 'react-native-tts'
import usePrefs from '../common/usePrefs'

interface IAudioCuesApi {
  pref?: AudioCuesPreferences
  setPref: any // TODO(gigilibala): Find out the correct type
  speak: (text: string) => void
}

export type AudioCuesPreferences = {
  enabled: boolean
}

export const defaultPref: AudioCuesPreferences = {
  enabled: true,
}

function useAudioCues(): IAudioCuesApi {
  const [pref, setPref] = usePrefs<AudioCuesPreferences>(
    '@audio_cues_preferences',
    defaultPref,
  )

  function speak(text: string) {
    Tts.speak(text)
  }

  return { speak, pref, setPref }
}

export const AudioCuesContext = createContext<IAudioCuesApi>(
  {} as IAudioCuesApi,
)

export function AudioCuesProvider({ children }: { children: ReactNode }) {
  const state = useAudioCues()

  return (
    <AudioCuesContext.Provider value={state}>
      {children}
    </AudioCuesContext.Provider>
  )
}
