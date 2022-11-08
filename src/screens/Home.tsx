import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { ReactNode } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { HomeStackParams } from '../components/navigators/HomeStack'
import useActivity from '../hooks/Activity'
import Icon from 'react-native-vector-icons/FontAwesome5'

type Props = NativeStackScreenProps<HomeStackParams, 'Home Screen'>

export default function Home({ route, navigation }: Props) {
  const { start, pause, resume, stop, status } = useActivity()
  const bigButtonSize = 80
  const smallButtonSize = 60

  const bigStartButton = (
    <Icon.Button
      name="play-circle"
      size={bigButtonSize}
      color="red"
      backgroundColor={'transparent'}
      style={styles.button}
      onPress={() => {
        console.log('starting')
        start()
      }}
    />
  )
  const smallStartButton = (
    <Icon.Button
      name="play-circle"
      size={smallButtonSize}
      color="red"
      backgroundColor={'transparent'}
      style={styles.button}
      onPress={() => {
        console.log('resume')
        resume()
      }}
    />
  )

  const pauseButton = (
    <Icon.Button
      name="pause-circle"
      size={smallButtonSize}
      color="orange"
      backgroundColor={'transparent'}
      style={styles.button}
      onPress={() => {
        console.log('resume')
        pause()
      }}
    />
  )

  const stopButton = (
    <Icon.Button
      name="stop-circle"
      size={smallButtonSize}
      color="black"
      backgroundColor={'transparent'}
      style={styles.button}
      onPress={() => {
        console.log('stop')
        stop()
      }}
    />
  )

  function renderButtons(): ReactNode {
    switch (status) {
      case 'in-progress':
        return (
          <View style={styles.rowButton}>
            <View>{pauseButton}</View>
            <View>{stopButton}</View>
          </View>
        )
      case 'paused':
        return (
          <View style={styles.rowButton}>
            <View>{smallStartButton}</View>
            <View>{stopButton}</View>
          </View>
        )
      case undefined:
      case 'stopped':
        return bigStartButton
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 3 }}></View>
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        {renderButtons()}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  rowButton: {
    flexDirection: 'row',
    alignContent: 'space-between',
  },
  button: {
    padding: 30,
  },
})
