import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome5'
import IonIcon from 'react-native-vector-icons/Ionicons'
import { HistoryStack, HistoryTitle } from './HistoryStack'
import { HomeStack, HomeTitle } from './HomeStack'
import { SettingsStack, SettingsTitle } from './SettingsStack'

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
          tabBarLabel: HomeTitle,
          headerTitle: HomeTitle,
          tabBarIcon: ({ color, size }) => (
            <Icon name={'home'} color={color} size={size} />
          ),
        }}
      />
      <Root.Screen
        name="HistoryStack"
        component={HistoryStack}
        options={{
          tabBarLabel: HistoryTitle,
          headerTitle: HistoryTitle,
          tabBarIcon: ({ color, size }) => (
            <Icon name={'history'} color={color} size={size} />
          ),
        }}
      />
      <Root.Screen
        name="SettingsStack"
        component={SettingsStack}
        options={{
          tabBarLabel: SettingsTitle,
          headerTitle: SettingsTitle,
          tabBarIcon: ({ color, size }) => (
            <IonIcon name={'settings'} color={color} size={size} />
          ),
        }}
      />
    </Root.Navigator>
  )
}
