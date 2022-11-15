import { useAsyncStorage } from '@react-native-async-storage/async-storage'
import { createContext, ReactNode, useEffect, useState } from 'react'
import Tts from 'react-native-tts'

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
  const [pref, setPref] = useState<AudioCuesPreferences>()
  const { setItem, getItem } = useAsyncStorage('@audio_cues_preferences')

  useEffect(() => {
    if (pref === undefined) {
      getItem()
        .then((value) => {
          if (value === null) {
            setPref(defaultPref)
          } else {
            const parsedPref: AudioCuesPreferences = JSON.parse(value)
            setPref(parsedPref)
          }
        })
        .catch((error) => {
          console.error('Unable to read audio cues pref from storage.')
        })
    } else {
      setItem(JSON.stringify(pref))
        .then(() => {
          console.log('Setting pref', pref)
        })
        .catch((error) => {
          console.error('Failed to write audio cue pref to storage.')
        })
    }
  }, [pref])

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
