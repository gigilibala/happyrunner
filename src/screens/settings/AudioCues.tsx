import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { SettingsList } from '../../components/SettingsList'
import {
  AudioCuesContext,
  AudioCuesPreferences,
} from '../../hooks/AudioCuesProvider'
import { Props } from '../navigators/RootNavigator'

export function AudioCues({ route, navigation }: Props<'Audio Cues'>) {
  const { speak, pref, setPref } = useContext(AudioCuesContext)
  const { t } = useTranslation()

  return SettingsList([
    {
      data: [
        {
          kind: 'switch',
          title: t('enabled'),
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
