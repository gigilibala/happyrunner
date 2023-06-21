import React, { createContext, PropsWithChildren } from 'react'
import {
  AudioCuesPreferences,
  DefaultAudioCuesPreferences,
} from '../../hooks/useAudioCues'
import { Device } from '../../hooks/useHeartRateMonitor'
import { usePrefs } from '../../hooks/usePrefs'
import { Units } from '../../hooks/useUnits'

type IPreferencesApi = ReturnType<typeof usePreferences>

type TypeNames = 'audioCues' | 'hrmDevice' | 'units'

function usePreferences() {
  const audioCuesState = usePrefs<AudioCuesPreferences>(
    '@audio_cues_preferences',
    DefaultAudioCuesPreferences,
  )
  const hrmDeviceState = usePrefs<Device>('@hrm_device_preferences', {
    id: '',
  })
  const unitsState = usePrefs<Units>('@units_preferences', {
    distance: 'miles',
    speed: 'pace',
  })

  function usePrefState(x: 'audioCues'): typeof audioCuesState
  function usePrefState(x: 'hrmDevice'): typeof hrmDeviceState
  function usePrefState(x: 'units'): typeof unitsState
  function usePrefState(x: TypeNames) {
    switch (x) {
      case 'audioCues':
        return audioCuesState
      case 'hrmDevice':
        return hrmDeviceState
      case 'units':
        return unitsState
    }
  }
  return { usePrefState }
}

export const PreferencesContext = createContext<IPreferencesApi>(
  {} as IPreferencesApi,
)

export function PreferencesProvider({ children }: PropsWithChildren) {
  const state = usePreferences()

  return (
    <PreferencesContext.Provider value={state}>
      {children}
    </PreferencesContext.Provider>
  )
}
