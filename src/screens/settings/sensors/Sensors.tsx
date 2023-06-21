import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native'
import { List } from 'react-native-paper'
import { SettingsScreenProps } from '../../RootNavigator'

export function Sensors({ navigation }: SettingsScreenProps<'Sensors'>) {
  const { t } = useTranslation()
  const navIcon = () => <List.Icon icon={'chevron-right'} />

  return (
    <SafeAreaView>
      <List.Item
        title={t('heartRateMonitor')}
        right={navIcon}
        onPress={() => navigation.navigate('HeartRateMonitor')}
      />
    </SafeAreaView>
  )
}
