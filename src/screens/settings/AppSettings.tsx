import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { SettingsList } from '../../components/SettingsList'
import { AudioCuesContext } from '../../hooks/AudioCuesProvider'
import { DatabaseContext } from '../../hooks/DatabaseProvider'
import { Props } from '../RootNavigator'

export function AppSettings({ navigation }: Props<'Settings'>) {
  const { clearDatabase } = useContext(DatabaseContext)
  const { pref } = useContext(AudioCuesContext)
  const { t } = useTranslation()

  return SettingsList([
    {
      title: t('general'),
      data: [
        {
          kind: 'navigation',
          title: t('heartRateMonitor'),
          onPress: () => navigation.navigate('Heart Rate Monitor'),
          icon: (
            <Icon.Button
              name={'bluetooth-b'}
              color={'blue'}
              backgroundColor={'transparent'}
            />
          ),
        },
        {
          kind: 'navigation',
          title: t('audioCues'),
          subTitle: pref?.enabled ? t('on') : t('off'),
          onPress: () => navigation.navigate('Audio Cues'),
          icon: (
            <Icon.Button
              name={'headphones-alt'}
              color={'grey'}
              backgroundColor={'transparent'}
            />
          ),
        },
        {
          kind: 'navigation',
          title: t('about'),
          onPress: () => navigation.navigate('About'),
          icon: (
            <Icon.Button
              name={'info-circle'}
              color={'grey'}
              backgroundColor={'transparent'}
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
                { text: t('yes'), onPress: () => clearDatabase() },
                { text: t('cancel') },
              ],
              { cancelable: true },
            )
          },
          icon: (
            <Icon.Button
              name={'database'}
              color={'grey'}
              backgroundColor={'transparent'}
            />
          ),
        },
      ],
    },
  ])
}
