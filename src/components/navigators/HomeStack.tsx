import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Home from '../../screens/Home'

export type HomeStackParams = {
  'Home Screen': undefined
}
export const HomeTitle = 'Home'

const Stack = createNativeStackNavigator<HomeStackParams>()

export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home Screen" component={Home} />
    </Stack.Navigator>
  )
}
