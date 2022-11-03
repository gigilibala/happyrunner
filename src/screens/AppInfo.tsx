import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { SafeAreaView, Text } from 'react-native'
import { AboutStackParams } from '../components/navigators/AboutStack'

type Props = NativeStackScreenProps<AboutStackParams, 'AppInfo'>

export function AppInfo({ route, navigation }: Props) {
  return (
    <SafeAreaView>
      <Text>Hello world! I wrote this app</Text>
    </SafeAreaView>
  )
}
