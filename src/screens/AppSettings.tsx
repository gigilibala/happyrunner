import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useContext, useState } from 'react'
import { SettingsStackParams } from '../components/navigators/SettingsStack'
import { SettingsList } from '../components/Settings'
import { DatabaseContext } from '../hooks/DatabaseProvider'
import Icon from 'react-native-vector-icons/FontAwesome5'

type Props = NativeStackScreenProps<SettingsStackParams, 'App Settings'>

export function AppSettings({ navigation }: Props) {
  const { clearDatabase } = useContext(DatabaseContext)
  const [isSwitchEnabled, setIsSwitchEnabled] = useState<boolean>(false)

  return SettingsList([
    {
      title: 'section 1',
      data: [
        {
          kind: 'navigation',
          title: 'Heart Rate Monitor',
          subTitle: 'meme',
          onPress: () => navigation.navigate('Heart Rate Monitor'),
        },
        {
          kind: 'navigation',
          title: 'Audio Cues',
          onPress: () => navigation.navigate('Audio Cues'),
        },
        {
          kind: 'button',
          title: 'Clear Database',
          onPress: () => clearDatabase(),
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
