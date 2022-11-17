import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome5'
import IonIcon from 'react-native-vector-icons/Ionicons'
import { AboutStack, AboutTitle } from './AboutStack'
import { HomeStack, HomeTitle } from './HomeStack'
import { SettingsStack, SettingsTitle } from './SettingsStack'

export type RootParams = {
  AboutStack: undefined
  SettingsStack: undefined
  HomeStack: undefined
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
      <Root.Screen
        name="AboutStack"
        component={AboutStack}
        options={{
          tabBarLabel: AboutTitle,
          headerTitle: AboutTitle,
          tabBarIcon: ({ color, size }) => (
            <Icon name={'info-circle'} color={color} size={size} />
          ),
        }}
      />
    </Root.Navigator>
  )
}
