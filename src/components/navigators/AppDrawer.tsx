import { createDrawerNavigator } from '@react-navigation/drawer'
import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome5'
import IonIcon from 'react-native-vector-icons/Ionicons'
import { AboutStack, AboutTitle } from './AboutStack'
import { HomeStack, HomeTitle } from './HomeStack'
import { SettingsStack, SettingsTitle } from './SettingsStack'

export type RootDrawerParams = {
  AboutStack: undefined
  SettingsStack: undefined
  HomeStack: undefined
}

const Drawer = createDrawerNavigator<RootDrawerParams>()

export function AppDrawer() {
  return (
    <Drawer.Navigator initialRouteName="SettingsStack">
      <Drawer.Screen
        name="HomeStack"
        component={HomeStack}
        options={{
          drawerLabel: HomeTitle,
          headerTitle: HomeTitle,
          drawerIcon: ({ color, size }) => (
            <Icon.Button
              name={'home'}
              color={color}
              size={size}
              backgroundColor={'transparent'}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="SettingsStack"
        component={SettingsStack}
        options={{
          drawerLabel: SettingsTitle,
          headerTitle: SettingsTitle,
          drawerIcon: ({ color, size }) => (
            <IonIcon.Button
              name={'settings'}
              color={color}
              size={size}
              backgroundColor={'transparent'}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="AboutStack"
        component={AboutStack}
        options={{
          drawerLabel: AboutTitle,
          headerTitle: AboutTitle,
          drawerIcon: ({ color, size }) => (
            <Icon.Button
              name={'info-circle'}
              color={color}
              size={size}
              backgroundColor={'transparent'}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  )
}
