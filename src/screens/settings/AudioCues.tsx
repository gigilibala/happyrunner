import { useTranslation } from 'react-i18next'
import { SettingsList } from '../../components/SettingsList'
import { AudioCuesPreferences, useAudioCues } from '../../hooks/audioCues'
import { SettingsScreenProps } from '../RootNavigator'

export function AudioCues({}: SettingsScreenProps<'AudioCues'>) {
  const { pref, setPref } = useAudioCues()
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
