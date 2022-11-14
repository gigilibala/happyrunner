import { useAsyncStorage } from '@react-native-async-storage/async-storage'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useEffect, useState } from 'react'
import { SettingsStackParams } from '../components/navigators/SettingsStack'
import { SettingsList } from '../components/SettingsList'
import useAudioCues from '../hooks/AudioCues'

type Props = NativeStackScreenProps<SettingsStackParams, 'Audio Cues'>

type AudioCuesPreferences = {
  enabled: boolean
}

const defaultPref: AudioCuesPreferences = {
  enabled: true,
}

export function AudioCues({ route, navigation }: Props) {
  const { speak } = useAudioCues()
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

  function setPrefsCorrectly(value?: AudioCuesPreferences) {}

  return SettingsList([
    {
      data: [
        {
          kind: 'switch',
          title: 'Enabled',
          switchValue: pref?.enabled,
          onPress: () =>
            setPref((prevValue) => {
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
