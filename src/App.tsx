import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native'
import { LogBox, useColorScheme } from 'react-native'
import { AudioCuesProvider } from './hooks/AudioCuesProvider'
import { DatabaseProvider } from './hooks/DatabaseProvider'
import './localization/i18n'
import { RootNavigator } from './screens/RootNavigator'

LogBox.ignoreLogs(['new NativeEventEmitter'])

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
