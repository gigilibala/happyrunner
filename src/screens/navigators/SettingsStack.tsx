import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack'
import { About } from '../About'
import { AppSettings } from '../AppSettings'
import { AudioCues } from '../AudioCues'
import { HeartRateMonitor } from '../HeartRateMonitor'

type SettingsStackParams = {
  'App Settings': undefined
  'Heart Rate Monitor': undefined
  'Scan Bluetooth': undefined
  'Audio Cues': undefined
  About: undefined
}
export type Props<T extends keyof SettingsStackParams> = NativeStackScreenProps<
  SettingsStackParams,
  T
>

export const SettingsTitle = 'Settings'

const Stack = createNativeStackNavigator<SettingsStackParams>()

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
