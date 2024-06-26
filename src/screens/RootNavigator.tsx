import {
  BottomTabScreenProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs'
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native'
import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import Icon from 'react-native-vector-icons/FontAwesome5'
import IonIcon from 'react-native-vector-icons/Ionicons'
import { ActivityType } from '../components/ActivityTypes'
import ActivityDetails from './history/ActivityDetails'
import { History } from './history/History'
import ActivityInProgress from './home/ActivityInProgress'
import Home from './home/Home'
import { About } from './settings/About'
import { Advanced } from './settings/Advanced'
import { AppSettings } from './settings/AppSettings'
import { AudioCues } from './settings/AudioCues'
import Maps from './settings/Maps'
import { Units } from './settings/Units'
import { HeartRateMonitor } from './settings/sensors/HeartRateMonitor'
import { Sensors } from './settings/sensors/Sensors'

type RootParams = {
  HomeRoot: NavigatorScreenParams<HomeScreenParams>
  HistoryRoot: NavigatorScreenParams<HistoryScreenParams>
  SettingsRoot: NavigatorScreenParams<SettingsScreenParams>
}
type RootScreenProps<T extends keyof RootParams> = BottomTabScreenProps<
  RootParams,
  T
>
const Root = createBottomTabNavigator<RootParams>()
export function RootNavigator() {
  const { t } = useTranslation()
  return (
    <Root.Navigator initialRouteName={'HomeRoot'}>
      <Root.Screen
        name={'HomeRoot'}
        component={HomeRoot}
        options={{
          title: t('screens.home'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name={'running'} color={color} size={size} />
          ),
        }}
      />
      <Root.Screen
        name={'HistoryRoot'}
        component={HistoryRoot}
        options={{
          title: t('screens.history'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name={'history'} color={color} size={size} />
          ),
          freezeOnBlur: true,
        }}
      />
      <Root.Screen
        name={'SettingsRoot'}
        component={SettingsRoot}
        options={{
          title: t('screens.settings'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <IonIcon name={'settings'} color={color} size={size} />
          ),
          freezeOnBlur: true,
        }}
      />
    </Root.Navigator>
  )
}

type HomeScreenParams = {
  Home: undefined
  ActivityInProgress: { type: ActivityType }
}
export type HomeScreenProps<T extends keyof HomeScreenParams> =
  CompositeScreenProps<
    NativeStackScreenProps<HomeScreenParams, T>,
    RootScreenProps<keyof RootParams>
  >
const HomeStack = createNativeStackNavigator<HomeScreenParams>()
function HomeRoot() {
  const { t } = useTranslation()
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name={'Home'}
        component={Home}
        options={{ title: t('screens.home') }}
      />
      <HomeStack.Screen
        name={'ActivityInProgress'}
        component={ActivityInProgress}
        options={{ title: t('screens.activityInProgress') }}
      />
    </HomeStack.Navigator>
  )
}

type HistoryScreenParams = {
  History: undefined
  ActivityDetails: { activityId: number; edit: boolean }
}
export type HistoryScreenProps<T extends keyof HistoryScreenParams> =
  CompositeScreenProps<
    NativeStackScreenProps<HistoryScreenParams, T>,
    RootScreenProps<keyof RootParams>
  >
const HistoryStack = createNativeStackNavigator<HistoryScreenParams>()
function HistoryRoot() {
  const { t } = useTranslation()
  return (
    <HistoryStack.Navigator>
      <HistoryStack.Screen
        name={'History'}
        component={History}
        options={{ title: t('screens.history') }}
      />
      <HistoryStack.Screen
        name={'ActivityDetails'}
        component={ActivityDetails}
        options={{ title: t('screens.activityDetails') }}
      />
    </HistoryStack.Navigator>
  )
}

type SettingsScreenParams = {
  Settings: undefined
  Sensors: undefined
  HeartRateMonitor: undefined
  AudioCues: undefined
  Units: undefined
  Advanced: undefined
  About: undefined
  Maps: undefined
}
export type SettingsScreenProps<T extends keyof SettingsScreenParams> =
  CompositeScreenProps<
    NativeStackScreenProps<SettingsScreenParams, T>,
    RootScreenProps<keyof RootParams>
  >
const SettingsStack = createNativeStackNavigator<SettingsScreenParams>()
function SettingsRoot() {
  const { t } = useTranslation()
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen
        name={'Settings'}
        component={AppSettings}
        options={{ title: t('screens.settings') }}
      />
      <SettingsStack.Screen
        name={'Sensors'}
        component={Sensors}
        options={{ title: t('sensors') }}
      />
      <SettingsStack.Screen
        name={'HeartRateMonitor'}
        component={HeartRateMonitor}
        options={{ title: t('heartRateMonitor') }}
      />
      <SettingsStack.Screen
        name={'AudioCues'}
        component={AudioCues}
        options={{ title: t('audioCues') }}
      />
      <SettingsStack.Screen
        name={'Units'}
        component={Units}
        options={{ title: t('units') }}
      />
      <SettingsStack.Screen
        name={'Advanced'}
        component={Advanced}
        options={{ title: t('advanced') }}
      />
      <SettingsStack.Screen
        name={'About'}
        component={About}
        options={{ title: t('screens.about') }}
      />
      <SettingsStack.Screen
        name={'Maps'}
        component={Maps}
        options={{ title: t('maps') }}
      />
    </SettingsStack.Navigator>
  )
}
