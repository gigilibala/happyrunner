import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AppInfo } from '../../screens/AppInfo'

export type AboutStackParams = {
  AppInfo: undefined
}
export const AboutTitle = 'About'

const Stack = createNativeStackNavigator<AboutStackParams>()

export function AboutStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AppInfo" component={AppInfo} />
    </Stack.Navigator>
  )
}
