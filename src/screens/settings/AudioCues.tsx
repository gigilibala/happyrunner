import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { List, Switch } from 'react-native-paper'
import { PreferencesContext } from '../../components/providers/PreferencesProvider'
import { SettingsScreenProps } from '../RootNavigator'

export function AudioCues({}: SettingsScreenProps<'AudioCues'>) {
  const { usePrefState } = useContext(PreferencesContext)
  const [pref, setPref] = usePrefState('audioCues')
  const { t } = useTranslation()

  return (
    <List.Item
      title={t('enabled')}
      right={() => (
        <Switch
          value={pref.enabled}
          onValueChange={() =>
            setPref((prev) => {
              return { ...prev, enabled: !prev.enabled }
            })
          }
        />
      )}
    />
  )
}
