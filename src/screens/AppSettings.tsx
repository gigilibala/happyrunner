import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useContext } from 'react'
import { SettingsStackParams } from '../components/navigators/SettingsStack'
import { Settings, SettingType } from '../components/Settings'
import { DatabaseContext } from '../hooks/DatabaseProvider'

type Props = NativeStackScreenProps<SettingsStackParams, 'App Settings'>

export function AppSettings({ navigation }: Props) {
  const { clearDatabase } = useContext(DatabaseContext)
  const items: SettingType[] = [
    {
      title: 'Heart Rate Monitor',
      navigate: () => navigation.navigate('Heart Rate Monitor'),
    },
    {
      title: 'Audio Cues',
      navigate: () => {
        navigation.navigate('Audio Cues')
      },
    },
    { title: 'Clear Database', navigate: () => clearDatabase() },
  ]

  return Settings(items)
}
