import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack'
import { History } from '../History'

export type HistoryStackParams = {
  History: undefined
}
export type Props<T extends keyof HistoryStackParams> = NativeStackScreenProps<
  HistoryStackParams,
  T
>

export const HistoryTitle = 'History'

const Stack = createNativeStackNavigator<HistoryStackParams>()

export function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="History" component={History} />
    </Stack.Navigator>
  )
}
