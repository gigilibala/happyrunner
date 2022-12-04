import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AudioCuesContext,
  AudioCuesPreferences,
} from '../../components/providers/AudioCuesProvider'
import { SettingsList } from '../../components/SettingsList'
import { SettingsScreenProps } from '../RootNavigator'

export function AudioCues({}: SettingsScreenProps<'AudioCues'>) {
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
