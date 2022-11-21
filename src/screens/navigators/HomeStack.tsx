import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Home from '../Home'
import { ScreenParams } from './RootNavigator'

export const HomeTitle = 'Home'

const Stack = createNativeStackNavigator<ScreenParams>()

export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home Screen" component={Home} />
    </Stack.Navigator>
  )
}
