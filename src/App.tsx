import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native'
import React from 'react'
import { LogBox, useColorScheme } from 'react-native'
import BleManager from 'react-native-ble-manager'
import { PaperProvider } from 'react-native-paper'
import { MenuProvider } from 'react-native-popup-menu'
import { enablePromise } from 'react-native-sqlite-storage'
import { DatabaseProvider } from './components/providers/DatabaseProvider'
import { PreferencesProvider } from './components/providers/PreferencesProvider'
import './localization/i18n'
import { RootNavigator } from './screens/RootNavigator'

LogBox.ignoreLogs([
  'new NativeEventEmitter',
  'Called stopObserving with existing subscriptions',
])

BleManager.start().then(() => {
  console.log('Bluetooth module initialized.')
})

enablePromise(true)

export default function App() {
  const scheme = useColorScheme()
  return (
    <PreferencesProvider>
      <DatabaseProvider>
        <PaperProvider>
          <NavigationContainer
            theme={scheme === 'dark' ? DarkTheme : DefaultTheme}
          >
            <MenuProvider>
              <RootNavigator />
            </MenuProvider>
          </NavigationContainer>
        </PaperProvider>
      </DatabaseProvider>
    </PreferencesProvider>
  )
}
