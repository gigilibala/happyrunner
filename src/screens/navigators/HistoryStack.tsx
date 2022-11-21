import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { History } from '../History'
import { ScreenParams } from './RootNavigator'

const Stack = createNativeStackNavigator<ScreenParams>()

export function HistoryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name={'History'} component={History} />
    </Stack.Navigator>
  )
}
