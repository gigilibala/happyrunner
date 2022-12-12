import { Theme } from '@react-navigation/native'
import { useKeepAwake } from '@sayem314/react-native-keep-awake'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { activityFeatures } from '../../components/ActivityTypes'
import { DistanceCard } from '../../components/cards/DistanceCard'
import { HeartRateCard } from '../../components/cards/HeartRateCard'
import { SpeedCard } from '../../components/cards/SpeedCard'
import { SpeedInputCard } from '../../components/cards/SpeedInputCard'
import { IcoMoon } from '../../components/IcoMoon'
import { useActivity } from '../../hooks/activity'
import { useHeartRateMonitor } from '../../hooks/heartRateMonitor'
import { useLocation } from '../../hooks/location'
import { useNotification } from '../../hooks/notification'
import { useSpeed } from '../../hooks/speed'
import { BUTTON_SIZE, useStyles } from '../../hooks/styles'
import { HomeScreenProps } from '../RootNavigator'

export default function ActivityInProgress({
  navigation,
  route,
}: HomeScreenProps<'ActivityInProgress'>) {
  const { type } = route.params
  const features = activityFeatures(type)

  const styles = useStyles(createStyles)
  const { t } = useTranslation()

  const [hrmState, hrmDispatch] = useHeartRateMonitor()
  const [locationState, locationDispatch] = useLocation()
  const [speedState, speedDispatch] = useSpeed()

  const [state, dispatch] = useActivity({
    heartRate: hrmState.heartRate,
    position: locationState.position,
    speed: speedState.rawSpeed,
    type,
  })
  const [notificationState, notificationDispatch] = useNotification()

  useKeepAwake()

  useEffect(() => {
    navigation.setOptions({
      title: t(`activityType.${type}`),
    })
    if (features.needsLocation) locationDispatch({ type: 'start' })
  }, [])

  useEffect(() => {
    // Add this so when the back button is pressed, we don't exit suddenly and
    // force the user to either pause or stop.
    return navigation.addListener('beforeRemove', (event) => {
      if (state.status === 'idle' || state.status === 'stopped')
        navigation.dispatch(event.data.action)
      else event.preventDefault()
    })
  }, [navigation, state.status])

  useEffect(() => {
    if (state.status === 'stopped') {
      navigation.navigate('HistoryRoot', {
        screen: 'ActivityDetails',
        params: { activityId: state.id, edit: true },
        initial: false,
      })
      navigation.pop()
    }
  }, [state.status])

  useEffect(() => {
    if (hrmState.device === undefined) return

    hrmDispatch({ type: 'initialize' })
  }, [hrmState.device])

  useEffect(() => {
    if (!hrmState.enabled || hrmState.device === undefined) return

    hrmDispatch({ type: 'connect', payload: { device: hrmState.device } })
  }, [hrmState.enabled])

  const startButton = (
    <TouchableOpacity onPress={() => dispatch({ type: 'start' })}>
      <Icon name={'play-circle'} size={BUTTON_SIZE} color={'green'} />
    </TouchableOpacity>
  )

  const resumeButton = (
    <TouchableOpacity onPress={() => dispatch({ type: 'resume' })}>
      <Icon name={'play-circle'} size={BUTTON_SIZE} color={'green'} />
    </TouchableOpacity>
  )

  const pauseButton = (
    <TouchableOpacity onPress={() => dispatch({ type: 'pause' })}>
      <Icon name={'pause-circle'} size={BUTTON_SIZE} color={'orange'} />
    </TouchableOpacity>
  )

  const stopButton = (
    <TouchableOpacity onPress={() => dispatch({ type: 'stop' })}>
      <Icon name={'stop-circle'} size={BUTTON_SIZE} color={'red'} />
    </TouchableOpacity>
  )

  const lapButton = (
    <TouchableOpacity onPress={() => dispatch({ type: 'nextLap' })}>
      <IcoMoon name={'lap'} size={BUTTON_SIZE} color={'blue'} />
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={[styles.safeAreaView, styles.verticalContainer]}>
      <View style={styles.activityInfoView}>
        <HeartRateCard
          heartRate={hrmState.heartRate}
          onPressConnectDevice={() =>
            navigation.navigate('SettingsRoot', {
              screen: 'HeartRateMonitorSettings',
              initial: false,
            })
          }
        />
        {features.needsSpeedInput ? (
          <SpeedInputCard
            speed={speedState.displaySpeed}
            onSpeedIncrease={() => speedDispatch({ type: 'increase' })}
            onSpeedDecrease={() => speedDispatch({ type: 'decrease' })}
          />
        ) : null}
        <DistanceCard
          lapDistance={state.lapDistance}
          totalDistance={state.totalDistance}
        />
        <SpeedCard
          speed={speedState.displaySpeed}
          lapSpeed={state.lapSpeed}
          totalSpeed={state.totalSpeed}
        />
      </View>

      {state.status === 'idle' ? (
        <View style={[styles.activityButtonView, { justifyContent: 'center' }]}>
          {startButton}
        </View>
      ) : (
        <View style={styles.activityButtonView}>
          <View>{state.status === 'in-progress' ? lapButton : stopButton}</View>
          <View>
            {state.status === 'in-progress' ? pauseButton : resumeButton}
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    activityInfoView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      alignContent: 'stretch',
      flexWrap: 'wrap',
      flexBasis: 'auto',
      flexGrow: 1,
    },
  })
