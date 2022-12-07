import React, { createContext, PropsWithChildren } from 'react'
import { AudioCuesPreferences } from '../../hooks/audioCues'
import { Device } from '../../hooks/heartRateMonitor'
import usePrefs from '../../hooks/prefs'
import { Units } from '../../hooks/units'

type IPreferencesApi = ReturnType<typeof usePreferences>

type TypeNames = 'audioCues' | 'hrmDevice' | 'units'

function usePreferences() {
  const audioCuesState = usePrefs<AudioCuesPreferences>(
    '@audio_cues_preferences',
    { enabled: true },
  )
  const hrmDeviceState = usePrefs<Device>('@hrm_device_preferences', {
    id: '',
    name: '',
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
