import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native'
import { LogBox, useColorScheme } from 'react-native'
import BleManager from 'react-native-ble-manager'
import { enablePromise } from 'react-native-sqlite-storage'
import { AudioCuesProvider } from './hooks/AudioCuesProvider'
import { DatabaseProvider } from './hooks/DatabaseProvider'
import './localization/i18n'
import { RootNavigator } from './screens/RootNavigator'

LogBox.ignoreLogs(['new NativeEventEmitter'])

BleManager.start().then(() => {
  console.log('Bluetooth module initialized.')
})

enablePromise(true)

export default function App() {
  const scheme = useColorScheme()
  return (
    <DatabaseProvider>
      <AudioCuesProvider>
        <NavigationContainer
          theme={scheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <RootNavigator />
        </NavigationContainer>
      </AudioCuesProvider>
    </DatabaseProvider>
  )
}
