import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native'
import { BluetoothProvider } from './hooks/BluetoothProvider'
import { DatabaseProvider } from './hooks/DatabaseProvider'
import { LogBox, useColorScheme } from 'react-native'
import { LocationProvider } from './hooks/LocationProvider'
import { AudioCuesProvider } from './hooks/AudioCuesProvider'
import { RootNavigator } from './screens/navigators/RootNavigator'
LogBox.ignoreLogs(['new NativeEventEmitter'])

export default function App() {
  const scheme = useColorScheme()
  return (
    <BluetoothProvider>
      <DatabaseProvider>
        <LocationProvider>
          <AudioCuesProvider>
            <NavigationContainer
              theme={scheme === 'dark' ? DarkTheme : DefaultTheme}
            >
              <RootNavigator />
            </NavigationContainer>
          </AudioCuesProvider>
        </LocationProvider>
      </DatabaseProvider>
    </BluetoothProvider>
  )
}
