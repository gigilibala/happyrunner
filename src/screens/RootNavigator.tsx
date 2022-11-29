import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import Icon from 'react-native-vector-icons/FontAwesome5'
import IonIcon from 'react-native-vector-icons/Ionicons'
import { HistoryStack } from './history/HistoryStack'
import { HomeStack } from './home/HomeStack'
import { SettingsStack } from './settings/SettingsStack'

export type ScreenParams = {
  History: undefined
  Home: undefined
  'Activity In Progress': undefined
  'Activity Details': { activityId: number }
  Settings: undefined
  'Heart Rate Monitor': undefined
  'Scan Bluetooth': undefined
  'Audio Cues': undefined
  About: undefined
}
export type Props<T extends keyof ScreenParams> = NativeStackScreenProps<
  ScreenParams,
  T
>

export type RootParams = {
  HomeStack: undefined
  HistoryStack: undefined
  SettingsStack: undefined
}

const Root = createBottomTabNavigator<RootParams>()

export function RootNavigator() {
  const { t } = useTranslation()
  return (
    <Root.Navigator initialRouteName={'HomeStack'}>
      <Root.Screen
        name={'HomeStack'}
        component={HomeStack}
        options={{
          title: t('screens.home'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name={'running'} color={color} size={size} />
          ),
        }}
      />
      <Root.Screen
        name={'HistoryStack'}
        component={HistoryStack}
        options={{
          title: t('screens.history'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name={'history'} color={color} size={size} />
          ),
        }}
      />
      <Root.Screen
        name={'SettingsStack'}
        component={SettingsStack}
        options={{
          title: t('screens.settings'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <IonIcon name={'settings'} color={color} size={size} />
          ),
        }}
      />
    </Root.Navigator>
  )
}
