import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { SettingsStackParams } from '../components/navigators/SettingsStack'
import { SettingsList } from '../components/SettingsList'
import useAudioCues, {
  AudioCuesPreferences,
  defaultPref,
} from '../hooks/AudioCues'

type Props = NativeStackScreenProps<SettingsStackParams, 'Audio Cues'>

export function AudioCues({ route, navigation }: Props) {
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
