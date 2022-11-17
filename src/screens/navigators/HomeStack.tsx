import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack'
import Home from '../Home'

type HomeStackParams = {
  'Home Screen': undefined
}
export type Props<T extends keyof HomeStackParams> = NativeStackScreenProps<
  HomeStackParams,
  T
>

export const HomeTitle = 'Home'

const Stack = createNativeStackNavigator<HomeStackParams>()

export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home Screen" component={Home} />
    </Stack.Navigator>
  )
}
