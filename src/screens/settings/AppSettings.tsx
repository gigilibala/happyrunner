import { Theme } from '@react-navigation/native'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView, StyleSheet } from 'react-native'
import { List } from 'react-native-paper'
import { PreferencesContext } from '../../components/providers/PreferencesProvider'
import { useStyles } from '../../hooks/styles'
import { SettingsScreenProps } from '../RootNavigator'

const ICON_SIZE: number = 25

export function AppSettings({ navigation }: SettingsScreenProps<'Settings'>) {
  const styles = useStyles(createStyles)
  const { t } = useTranslation()

  const { usePrefState } = useContext(PreferencesContext)
  const [audioCuesPref] = usePrefState('audioCues')
  const navIcon = () => <List.Icon icon={'chevron-right'} />

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <List.Section>
        <List.Subheader>{t('general')}</List.Subheader>
        <List.Item
          title={t('heartRateMonitor')}
          left={({ color, style }) => (
            <List.Icon icon={'bluetooth'} color={color} style={style} />
          )}
          right={navIcon}
          onPress={() => navigation.navigate('HeartRateMonitorSettings')}
        />
        <List.Item
          title={t('audioCues')}
          description={audioCuesPref.enabled ? t('on') : t('off')}
          left={({ color, style }) => (
            <List.Icon icon={'voicemail'} color={color} style={style} />
          )}
          right={navIcon}
          onPress={() => navigation.navigate('AudioCues')}
        />
        <List.Item
          title={t('units')}
          left={({ color, style }) => (
            <List.Icon
              icon={'map-marker-distance'}
              color={color}
              style={style}
            />
          )}
          right={navIcon}
          onPress={() => navigation.navigate('Units')}
        />
        <List.Item
          title={t('advanced')}
          left={({ color, style }) => (
            <List.Icon icon={'database-settings'} color={color} style={style} />
          )}
          right={navIcon}
          onPress={() => navigation.navigate('Advanced')}
        />
        <List.Item
          title={t('screens.about')}
          left={({ color, style }) => (
            <List.Icon icon={'information'} color={color} style={style} />
          )}
          right={navIcon}
          onPress={() => navigation.navigate('About')}
        />
      </List.Section>
    </SafeAreaView>
  )
}

const createStyles = (theme: Theme) => StyleSheet.create({})
