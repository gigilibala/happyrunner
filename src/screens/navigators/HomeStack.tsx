import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Home from '../home/Home'
import { ScreenParams } from './RootNavigator'

const Stack = createNativeStackNavigator<ScreenParams>()

export function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name={'Home'} component={Home} />
    </Stack.Navigator>
  )
}
