import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import Icon from 'react-native-vector-icons/FontAwesome5'
import IonIcon from 'react-native-vector-icons/Ionicons'
import { HistoryStack, HistoryTitle } from './HistoryStack'
import { HomeStack, HomeTitle } from './HomeStack'
import { SettingsStack, SettingsTitle } from './SettingsStack'

export type ScreenParams = {
  History: undefined
  'Home Screen': undefined
  'App Settings': undefined
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
  return (
    <Root.Navigator initialRouteName="SettingsStack">
      <Root.Screen
        name="HomeStack"
        component={HomeStack}
        options={{
          title: HomeTitle,
          tabBarIcon: ({ color, size }) => (
            <Icon name={'running'} color={color} size={size} />
          ),
        }}
      />
      <Root.Screen
        name="HistoryStack"
        component={HistoryStack}
        options={{
          title: HistoryTitle,
          tabBarIcon: ({ color, size }) => (
            <Icon name={'history'} color={color} size={size} />
          ),
        }}
      />
      <Root.Screen
        name="SettingsStack"
        component={SettingsStack}
        options={{
          title: SettingsTitle,
          tabBarIcon: ({ color, size }) => (
            <IonIcon name={'settings'} color={color} size={size} />
          ),
        }}
      />
    </Root.Navigator>
  )
}
