import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import { AppDrawer } from './components/navigators/AppDrawer'
import { BluetoothProvider } from './hooks/BluetoothProvider'
import { DatabaseProvider } from './hooks/DatabaseProvider'
import { LogBox } from 'react-native'
import { LocationProvider } from './hooks/LocationProvider'
import { AudioCuesProvider } from './hooks/AudioCuesProvider'
LogBox.ignoreLogs(['new NativeEventEmitter'])

export default function App() {
  return (
    <BluetoothProvider>
      <DatabaseProvider>
        <LocationProvider>
          <AudioCuesProvider>
            <NavigationContainer>
              <AppDrawer />
            </NavigationContainer>
          </AudioCuesProvider>
        </LocationProvider>
      </DatabaseProvider>
    </BluetoothProvider>
  )
}
