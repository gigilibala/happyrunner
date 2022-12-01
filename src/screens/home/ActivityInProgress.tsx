import { Theme } from '@react-navigation/native'
import React, { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/FontAwesome5'
import IconMat from 'react-native-vector-icons/MaterialIcons'
import { BUTTON_SIZE, useStyles } from '../../common/styles'
import HarizontalCard from '../../components/HarizontalCard'
import useActivity from '../../hooks/Activity'
import { HeartRateMonitorContext } from '../../hooks/HeartRateMonitorProvider'
import { useLocation } from '../../hooks/Location'
import useNotification from '../../hooks/Notification'
import { HomeScreenProps } from '../RootNavigator'

export default function ActivityInProgress({
  navigation,
  route,
}: HomeScreenProps<'ActivityInProgress'>) {
  const styles = useStyles(createStyles)
  const { t } = useTranslation()
  const { heartRate } = useContext(HeartRateMonitorContext)
  const { position } = useLocation()
  const { state, dispatch, id } = useActivity({
    heartRate,
    position,
    params: route.params.activityParams,
  })
  const { displayNotification, cancelNotification } = useNotification()

  useEffect(() => {
    navigation.setOptions({
      title: t(`activityType.${route.params.activityParams.type}`),
    })

    displayNotification().catch((error) =>
      console.log('Failed to start notification: ', error),
    )

    return () => {
      cancelNotification().catch((error) =>
        console.log('Failed to cancel notification: ', error),
      )
    }
  }, [])

  useEffect(() => {
    // Add this so when the back button is pressed, we don't exit suddenly and
    // force the user to either pause or stop.
    navigation.addListener('beforeRemove', (event) => {
      if (state.status === 'stopped') navigation.dispatch(event.data.action)
      else event.preventDefault()
    })
  }, [navigation, state])

  useEffect(() => {
    if (state.status === 'stopped') {
      navigation.navigate('HistoryRoot', {
        screen: 'ActivityDetails',
        params: { activityId: id },
        initial: false,
      })
      navigation.pop()
    }
  }, [state])

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
      <IconMat name={'timelapse'} size={BUTTON_SIZE + 5} color={'blue'} />
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={[styles.safeAreaView, styles.verticalContainer]}>
      <View style={styles.activityInfoView}>
        <HarizontalCard
          title={'Heart Rate'}
          color={'red'}
          unit={'BPM'}
          value1={heartRate || 'N/A'}
        />
        <HarizontalCard
          title={'Heart Rate'}
          color={'red'}
          unit={'BPM'}
          value1={heartRate || 'N/A'}
          value2={{ value: heartRate || 'N/A', scope: 'Lap' }}
        />
        <HarizontalCard
          title={'Heart Rate'}
          color={'red'}
          unit={'BPM'}
          value1={heartRate || 'N/A'}
          value2={{ value: heartRate || 'N/A', scope: 'Lap' }}
          value3={{ value: heartRate || 'N/A', scope: 'Total' }}
        />
        <HarizontalCard
          title={'Heart Rate'}
          color={'red'}
          unit={'BPM'}
          value1={heartRate || 'N/A'}
        />
        <HarizontalCard
          title={'Heart Rate'}
          color={'red'}
          unit={'BPM'}
          value1={heartRate || 'N/A'}
          value2={{ value: heartRate || 'N/A', scope: 'Lap' }}
        />
        <HarizontalCard
          title={'Heart Rate'}
          color={'red'}
          unit={'BPM'}
          value1={heartRate || 'N/A'}
          value2={{ value: heartRate || 'N/A', scope: 'Lap' }}
          value3={{ value: heartRate || 'N/A', scope: 'Total' }}
        />
      </View>

      <View style={styles.activityButtonView}>
        <View>{state.status === 'in-progress' ? lapButton : stopButton}</View>
        <View>
          {state.status === 'in-progress' ? pauseButton : resumeButton}
        </View>
      </View>
    </SafeAreaView>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    activityInfoView: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
  })
