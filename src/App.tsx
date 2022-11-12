import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import { AppDrawer } from './components/navigators/AppDrawer'
import { BluetoothProvider } from './hooks/BluetoothProvider'
import { DatabaseProvider } from './hooks/DatabaseProvider'
import { LogBox } from 'react-native'
LogBox.ignoreLogs(['new NativeEventEmitter'])

export default function App() {
  return (
    <BluetoothProvider>
      <DatabaseProvider>
        <NavigationContainer>
          <AppDrawer />
        </NavigationContainer>
      </DatabaseProvider>
    </BluetoothProvider>
  )
}
