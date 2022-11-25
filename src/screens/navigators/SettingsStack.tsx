import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import { About } from '../settings/About'
import { AppSettings } from '../settings/AppSettings'
import { AudioCues } from '../settings/AudioCues'
import { HeartRateMonitor } from '../settings/HeartRateMonitor'
import { ScreenParams } from './RootNavigator'

const Stack = createNativeStackNavigator<ScreenParams>()

export function SettingsStack() {
  const { t } = useTranslation()
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={'Settings'}
        component={AppSettings}
        options={{ title: t('screens.history') }}
      />
      <Stack.Screen
        name={'Heart Rate Monitor'}
        component={HeartRateMonitor}
        options={{ title: t('heartRateMonitor') }}
      />
      <Stack.Screen
        name={'Audio Cues'}
        component={AudioCues}
        options={{ title: t('audioCues') }}
      />
      <Stack.Screen
        name={'About'}
        component={About}
        options={{ title: t('screens.about') }}
      />
    </Stack.Navigator>
  )
}
