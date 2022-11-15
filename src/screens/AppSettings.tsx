import { useContext, useState } from 'react'
import { Props } from '../components/navigators/SettingsStack'
import { SettingsList } from '../components/SettingsList'
import { DatabaseContext } from '../hooks/DatabaseProvider'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { AudioCuesContext } from '../hooks/AudioCuesProvider'
import { BluetoothContext } from '../hooks/BluetoothProvider'
import { Alert } from 'react-native'

export function AppSettings({ navigation }: Props<'App Settings'>) {
  const { clearDatabase } = useContext(DatabaseContext)
  const { pref } = useContext(AudioCuesContext)
  const { connectedDevice } = useContext(BluetoothContext)
  // TODO(gigilibala): Remove the experimental switch.
  const [isSwitchEnabled, setIsSwitchEnabled] = useState<boolean>(false)

  return SettingsList([
    {
      title: 'General',
      data: [
        {
          kind: 'navigation',
          title: 'Heart Rate Monitor',
          subTitle: connectedDevice?.name || undefined,
          onPress: () => navigation.navigate('Heart Rate Monitor'),
        },
        {
          kind: 'navigation',
          title: 'Audio Cues',
          subTitle: pref?.enabled ? 'on' : 'off',
          onPress: () => navigation.navigate('Audio Cues'),
        },
      ],
    },
    {
      title: 'Advanced',
      data: [
        {
          kind: 'button',
          title: 'Clear Database',
          onPress: () => {
            Alert.alert(
              'Clear Database',
              'This action deletes the database and is not recoverable. Do you want to continue?',
              [
                { text: 'Yes', onPress: () => clearDatabase() },
                { text: 'Cancel' },
              ],
              { cancelable: true },
            )
          },
        },
        {
          kind: 'switch',
          title: 'title',
          subTitle: 'subtitle',
          onPress: () => setIsSwitchEnabled((prevValue) => !prevValue),
          switchValue: isSwitchEnabled,
          icon: (
            <Icon.Button
              name="play-circle"
              color="red"
              backgroundColor={'transparent'}
            />
          ),
        },
      ],
    },
  ])
}
