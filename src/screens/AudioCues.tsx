import { useContext } from 'react'
import { Props } from './navigators/SettingsStack'
import { SettingsList } from '../components/SettingsList'
import {
  AudioCuesContext,
  AudioCuesPreferences,
  defaultPref,
} from '../hooks/AudioCuesProvider'

export function AudioCues({ route, navigation }: Props<'Audio Cues'>) {
  const { speak, pref, setPref } = useContext(AudioCuesContext)

  return SettingsList([
    {
      data: [
        {
          kind: 'switch',
          title: 'Enabled',
          switchValue: pref?.enabled,
          onPress: () =>
            setPref((prevValue: AudioCuesPreferences) => {
              if (prevValue === undefined) return defaultPref
              const newValue = { ...prevValue } as AudioCuesPreferences
              newValue.enabled = !prevValue.enabled
              return newValue
            }),
        },
      ],
    },
  ])
}
