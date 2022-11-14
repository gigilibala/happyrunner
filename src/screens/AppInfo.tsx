import { SafeAreaView, Text } from 'react-native'
import { Props } from '../components/navigators/AboutStack'

export function AppInfo({ route, navigation }: Props<'AppInfo'>) {
  return (
    <SafeAreaView>
      <Text>Hello world! I wrote this App</Text>
    </SafeAreaView>
  )
}
