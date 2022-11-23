import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { About } from '../settings/About'
import { AppSettings } from '../settings/AppSettings'
import { AudioCues } from '../settings/AudioCues'
import { HeartRateMonitor } from '../settings/HeartRateMonitor'
import { ScreenParams } from './RootNavigator'

const Stack = createNativeStackNavigator<ScreenParams>()

export function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name={'Settings'} component={AppSettings} />
      <Stack.Screen name={'Heart Rate Monitor'} component={HeartRateMonitor} />
      <Stack.Screen name={'Audio Cues'} component={AudioCues} />
      <Stack.Screen name={'About'} component={About} />
    </Stack.Navigator>
  )
}
