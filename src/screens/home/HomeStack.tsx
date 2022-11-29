import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import ActivityDetails from '../history/ActivityDetails'
import { ScreenParams } from '../RootNavigator'
import ActivityInProgress from './ActivityInProgress'
import Home from './Home'

const Stack = createNativeStackNavigator<ScreenParams>()

export function HomeStack() {
  const { t } = useTranslation()
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={'Home'}
        component={Home}
        options={{ title: t('screens.home') }}
      />
      <Stack.Screen
        name={'Activity In Progress'}
        component={ActivityInProgress}
      />
      <Stack.Screen
        name={'Activity Details'}
        component={ActivityDetails}
        options={{ title: t('screens.activityDetails') }}
      />
    </Stack.Navigator>
  )
}
