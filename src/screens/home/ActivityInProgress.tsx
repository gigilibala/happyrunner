import { Theme } from '@react-navigation/native'
import { useKeepAwake } from '@sayem314/react-native-keep-awake'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { activityFeatures } from '../../components/ActivityTypes'
import { IcoMoon } from '../../components/IcoMoon'
import { DistanceCard } from '../../components/cards/DistanceCard'
import { DurationCard } from '../../components/cards/DurationCard'
import { HeartRateCard } from '../../components/cards/HeartRateCard'
import { SpeedCard } from '../../components/cards/SpeedCard'
import { SpeedInputCard } from '../../components/cards/SpeedInputCard'
import { useActivity } from '../../hooks/useActivity'
import { useHeartRateMonitor } from '../../hooks/useHeartRateMonitor'
import { useLocation } from '../../hooks/useLocation'
import { useNotification } from '../../hooks/useNotification'
import { useSpeed } from '../../hooks/useSpeed'
import { BUTTON_SIZE, useStyles } from '../../hooks/useStyles'
import { useUnits } from '../../hooks/useUnits'
import { HomeScreenProps } from '../RootNavigator'

export default function ActivityInProgress({
  navigation,
  route,
}: HomeScreenProps<'ActivityInProgress'>) {
  const { type } = route.params
  const features = activityFeatures(type)

  const styles = useStyles(createStyles)
  const { t } = useTranslation()

  const { units, speedUnitStr } = useUnits()
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
    const bodyArray = []
    if (hrmState.heartRate !== undefined)
      bodyArray.push(`${hrmState.heartRate} BPM`)
    bodyArray.push(`${state.distance.total} ${units.distance}`)
    bodyArray.push(`${speedState.displaySpeed} ${speedUnitStr}`)

    notificationDispatch({
      type: 'updateFg',
      payload: {
        title: t(`activityType.${type}`),
        body: bodyArray.join(', '),
      },
    })
  }, [type, state.duration, hrmState.heartRate, state.speed])

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

    hrmDispatch({ type: 'connect' })
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
          lapHeartRate={state.heartRate?.lap}
          totalHeartRate={state.heartRate?.total}
          onPressConnectDevice={() =>
            navigation.navigate('SettingsRoot', {
              screen: 'Sensors',
              initial: false,
            })
          }
        />
        <SpeedInputCard
          speed={speedState.displaySpeed}
          onSpeedIncrease={() => speedDispatch({ type: 'increase' })}
          onSpeedDecrease={() => speedDispatch({ type: 'decrease' })}
        />
        <DistanceCard
          lapDistance={state.distance.lap}
          totalDistance={state.distance.total}
        />
        <SpeedCard
          speed={speedState.displaySpeed}
          lapSpeed={state.speed.lap}
          totalSpeed={state.speed.total}
        />
        <DurationCard lap={state.duration.lap} total={state.duration.total} />
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
      flex: 1,
    },
  })
