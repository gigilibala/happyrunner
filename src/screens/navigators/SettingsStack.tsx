import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { About } from '../About'
import { AppSettings } from '../AppSettings'
import { AudioCues } from '../AudioCues'
import { HeartRateMonitor } from '../HeartRateMonitor'
import { ScreenParams } from './RootNavigator'

export const SettingsTitle = 'Settings'

const Stack = createNativeStackNavigator<ScreenParams>()

export function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="App Settings"
        component={AppSettings}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Heart Rate Monitor" component={HeartRateMonitor} />
      <Stack.Screen name="Audio Cues" component={AudioCues} />
      <Stack.Screen name="About" component={About} />
    </Stack.Navigator>
  )
}
