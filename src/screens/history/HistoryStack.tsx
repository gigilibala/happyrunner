import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import { ScreenParams } from '../RootNavigator'
import { History } from './History'

const Stack = createNativeStackNavigator<ScreenParams>()

export function HistoryStack() {
  const { t } = useTranslation()
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={'History'}
        component={History}
        options={{ title: t('screens.history') }}
      />
    </Stack.Navigator>
  )
}
