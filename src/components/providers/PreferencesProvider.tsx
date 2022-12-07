import React, { createContext, PropsWithChildren } from 'react'
import { AudioCuesPreferences } from '../../hooks/audioCues'
import { Device } from '../../hooks/heartRateMonitor'
import usePrefs from '../../hooks/prefs'

type IPreferencesApi = ReturnType<typeof usePreferences>

type TypeNames = 'audioCues' | 'hrmDevice'

function usePreferences() {
  const audioCuesState = usePrefs<AudioCuesPreferences>(
    '@audio_cues_preferences',
    { enabled: true },
  )
  const hrmDeviceState = usePrefs<Device>('@hrm_device', { id: '', name: '' })

  function usePrefState(x: 'audioCues'): typeof audioCuesState
  function usePrefState(x: 'hrmDevice'): typeof hrmDeviceState
  function usePrefState(x: TypeNames) {
    switch (x) {
      case 'audioCues':
        return audioCuesState
      case 'hrmDevice':
        return hrmDeviceState
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
