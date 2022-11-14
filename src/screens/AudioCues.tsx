import { Props } from '../components/navigators/SettingsStack'
import { SettingsList } from '../components/SettingsList'
import useAudioCues, {
  AudioCuesPreferences,
  defaultPref,
} from '../hooks/AudioCues'

export function AudioCues({ route, navigation }: Props<'Audio Cues'>) {
  const { speak, pref, setPref } = useAudioCues()

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
