import { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native'
import { List, Switch, TextInput } from 'react-native-paper'
import { PreferencesContext } from '../../components/providers/PreferencesProvider'
import { SettingsScreenProps } from '../RootNavigator'

export function AudioCues({}: SettingsScreenProps<'AudioCues'>) {
  const { usePrefState } = useContext(PreferencesContext)
  const [pref, setPref] = usePrefState('audioCues')
  const { t } = useTranslation()

  useEffect(() => {
    console.log(JSON.stringify(pref))
  }, [])

  return (
    <SafeAreaView>
      <List.Item
        title={t('enabled')}
        right={() => (
          <Switch
            value={pref.enabled}
            onValueChange={(value) =>
              setPref((prev) => {
                return { ...prev, enabled: value }
              })
            }
          />
        )}
      />
      {pref.enabled ? (
        // TODO: It is a terrible UI. Make it better.
        <List.Section title={t('triggers')}>
          <List.Item
            title={() => (
              <TextInput
                style={{ width: '70%' }}
                mode='outlined'
                disabled={!pref.triggerTime}
                label={'Time trigger (Seconds)'}
                value={pref.triggerTimeSeconds.toString()}
                onChangeText={(text) => {
                  setPref((prev) => {
                    return { ...prev, triggerTimeSeconds: Number(text) }
                  })
                }}
              />
            )}
            right={() => (
              <Switch
                value={pref.triggerTime}
                onValueChange={(value) => {
                  setPref((prev) => {
                    return { ...prev, triggerTime: value }
                  })
                }}
              />
            )}
          />
        </List.Section>
      ) : null}
    </SafeAreaView>
  )
}
