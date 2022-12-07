import { Theme } from '@react-navigation/native'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import MatIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { DatabaseContext } from '../../components/providers/DatabaseProvider'
import { PreferencesContext } from '../../components/providers/PreferencesProvider'
import { SettingsList } from '../../components/SettingsList'
import { useStyles } from '../../hooks/styles'
import { SettingsScreenProps } from '../RootNavigator'

const ICON_SIZE: number = 25

export function AppSettings({ navigation }: SettingsScreenProps<'Settings'>) {
  const styles = useStyles(createStyles)
  const { t } = useTranslation()

  const [_, dbDispatch] = useContext(DatabaseContext)

  const { usePrefState } = useContext(PreferencesContext)
  const [audioCuesPref] = usePrefState('audioCues')
  const [{ distance, speed }, setUnits] = usePrefState('units')

  return SettingsList([
    {
      title: t('general'),
      data: [
        {
          kind: 'navigation',
          title: t('heartRateMonitor'),
          onPress: () => navigation.navigate('HeartRateMonitorSettings'),
          icon: (
            <Icon
              name={'bluetooth-b'}
              color={'blue'}
              size={ICON_SIZE}
              style={styles.icon}
            />
          ),
        },
        {
          kind: 'navigation',
          title: t('audioCues'),
          value: audioCuesPref.enabled ? t('on') : t('off'),
          onPress: () => navigation.navigate('AudioCues'),
          icon: (
            <Icon
              name={'headphones-alt'}
              color={'grey'}
              size={ICON_SIZE}
              style={styles.icon}
            />
          ),
        },
        {
          kind: 'navigation',
          title: t('screens.about'),
          onPress: () => navigation.navigate('About'),
          icon: (
            <Icon
              name={'info-circle'}
              color={'grey'}
              size={ICON_SIZE}
              style={styles.icon}
            />
          ),
        },
      ],
    },
    {
      title: t('units'),
      data: [
        {
          kind: 'button',
          title: t('distance'),
          onPress: () =>
            setUnits((prev) => ({
              ...prev,
              distance: prev.distance === 'kilometers' ? 'miles' : 'kilometers',
            })),
          value: t(distance),
          icon: (
            <MatIcon
              name={'map-marker-distance'}
              color={'grey'}
              size={ICON_SIZE}
              style={styles.icon}
            />
          ),
        },
        {
          kind: 'button',
          title: t('speed'),
          onPress: () =>
            setUnits((prev) => ({
              ...prev,
              speed: prev.speed === 'pace' ? 'speed' : 'pace',
            })),
          value: t(speed),
          icon: (
            <MatIcon
              name={'speedometer'}
              color={'grey'}
              size={ICON_SIZE}
              style={styles.icon}
            />
          ),
        },
      ],
    },
    {
      title: t('advanced'),
      data: [
        {
          kind: 'button',
          title: t('clearDatabase'),
          onPress: () => {
            Alert.alert(
              t('clearDatabase'),
              t('clearDatabaseNotice'),
              [
                {
                  text: t('yes'),
                  onPress: () => dbDispatch({ type: 'clearDatabase' }),
                  style: 'destructive',
                },
                { text: t('cancel'), style: 'cancel' },
              ],
              { cancelable: true },
            )
          },
          icon: (
            <Icon
              name={'database'}
              color={'grey'}
              size={ICON_SIZE}
              style={styles.icon}
            />
          ),
        },
      ],
    },
  ])
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    icon: { padding: 5 },
  })
