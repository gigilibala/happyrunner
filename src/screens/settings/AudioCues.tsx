import { useContext } from 'react'
import { SettingsList } from '../../components/SettingsList'
import {
  AudioCuesContext,
  AudioCuesPreferences,
} from '../../hooks/AudioCuesProvider'
import { Props } from '../navigators/RootNavigator'

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
              const newValue = { ...prevValue } as AudioCuesPreferences
              newValue.enabled = !prevValue.enabled
              return newValue
            }),
        },
      ],
    },
  ])
}
