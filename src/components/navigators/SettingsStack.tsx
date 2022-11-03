import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { HeartRateMonitor } from '../../screens/HeartRateMonitor'
import { ScanBluetooth } from '../../screens/ScanBluetooth'
import { Settings } from '../../screens/Settings'

export type SettingsStackParams = {
  Settings: undefined
  'Heart Rate Monitor': undefined
  'Scan Bluetooth': undefined
}
export const SettingsTitle = 'Settings'

const Stack = createNativeStackNavigator<SettingsStackParams>()

export function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Heart Rate Monitor" component={HeartRateMonitor} />
      <Stack.Screen name="Scan Bluetooth" component={ScanBluetooth} />
    </Stack.Navigator>
  )
}
