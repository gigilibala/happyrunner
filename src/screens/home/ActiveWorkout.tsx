import { Theme } from '@react-navigation/native'
import React, { useContext, useEffect } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useStyles } from '../../common/styles'
import HarizontalCard from '../../components/HarizontalCard'
import useActivity from '../../hooks/Activity'
import { HeartRateMonitorContext } from '../../hooks/HeartRateMonitorProvider'
import useNotification from '../../hooks/Notification'
import { Props } from '../navigators/RootNavigator'

const BUTTON_SIZE = 100

export default function ActiveWorkout({
  route,
  navigation,
}: Props<'Active Workout'>) {
  const styles = useStyles(createStyles)
  const { status, setStatus, start, position } = useActivity()
  const { displayNotification, cancelNotification } = useNotification()
  const { heartRate } = useContext(HeartRateMonitorContext)

  useEffect(() => {
    displayNotification()
      .then(() => {
        start()
      })
      .catch((error) => console.log('Failed to start notification: ', error))

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
      event.preventDefault()
    })
  }, [navigation])

  const resumeButton = (
    <TouchableOpacity
      onPress={() => {
        setStatus('in-progress')
      }}
    >
      <Icon name={'play-circle'} size={BUTTON_SIZE} color={'green'} />
    </TouchableOpacity>
  )

  const pauseButton = (
    <TouchableOpacity
      onPress={() => {
        setStatus('paused')
      }}
    >
      <Icon name={'pause-circle'} size={BUTTON_SIZE} color={'orange'} />
    </TouchableOpacity>
  )

  const stopButton = (
    <TouchableOpacity
      onPress={() => {
        setStatus('stopped')
        navigation.goBack()
      }}
    >
      <Icon name={'stop-circle'} size={BUTTON_SIZE} color={'red'} />
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
        <View>{status === 'in-progress' ? pauseButton : resumeButton}</View>
        <View>{stopButton}</View>
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
    activityButtonView: {
      flexDirection: 'row',
      padding: 20,
      justifyContent: 'space-evenly',
    },
  })
