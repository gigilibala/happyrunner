import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { History } from '../History'
import { ScreenParams } from './RootNavigator'

export const HistoryTitle = 'History'

const Stack = createNativeStackNavigator<ScreenParams>()

export function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="History" component={History} />
    </Stack.Navigator>
  )
}
