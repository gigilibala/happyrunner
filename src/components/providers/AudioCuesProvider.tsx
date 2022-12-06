import { createContext, PropsWithChildren } from 'react'
import Tts from 'react-native-tts'
import usePrefs from '../../hooks/prefs'

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

export function AudioCuesProvider({ children }: PropsWithChildren) {
  const state = useAudioCues()

  return (
    <AudioCuesContext.Provider value={state}>
      {children}
    </AudioCuesContext.Provider>
  )
}
