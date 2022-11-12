import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import { AppDrawer } from './components/navigators/AppDrawer'
import { BluetoothProvider } from './hooks/BluetoothProvider'
import { DatabaseProvider } from './hooks/DatabaseProvider'
import { LogBox } from 'react-native'
import { LocationProvider } from './hooks/LocationProvider'
LogBox.ignoreLogs(['new NativeEventEmitter'])

export default function App() {
  return (
    <BluetoothProvider>
      <DatabaseProvider>
        <LocationProvider>
          <NavigationContainer>
            <AppDrawer />
          </NavigationContainer>
        </LocationProvider>
      </DatabaseProvider>
    </BluetoothProvider>
  )
}
