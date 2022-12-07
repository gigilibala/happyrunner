import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { PreferencesContext } from '../../components/providers/PreferencesProvider'
import { SettingsList } from '../../components/SettingsList'
import { AudioCuesPreferences } from '../../hooks/audioCues'
import { SettingsScreenProps } from '../RootNavigator'

export function AudioCues({}: SettingsScreenProps<'AudioCues'>) {
  const { usePrefState } = useContext(PreferencesContext)
  const [pref, setPref] = usePrefState('audioCues')
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
