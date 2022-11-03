import { createDrawerNavigator } from '@react-navigation/drawer'
import React from 'react'
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
    <Drawer.Navigator>
      <Drawer.Screen
        name="HomeStack"
        component={HomeStack}
        options={{
          drawerLabel: HomeTitle,
          headerTitle: HomeTitle,
        }}
      />
      <Drawer.Screen
        name="SettingsStack"
        component={SettingsStack}
        options={{ drawerLabel: SettingsTitle, headerTitle: SettingsTitle }}
      />
      <Drawer.Screen
        name="AboutStack"
        component={AboutStack}
        options={{ drawerLabel: AboutTitle, headerTitle: AboutTitle }}
      />
    </Drawer.Navigator>
  )
}
