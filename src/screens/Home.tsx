import React, { ReactNode } from 'react'
import { Button, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Props } from './navigators/HomeStack'
import useActivity from '../hooks/Activity'
import Icon from 'react-native-vector-icons/FontAwesome5'

export default function Home({ route, navigation }: Props<'Home Screen'>) {
  const { start, pause, resume, stop, status } = useActivity()

  const bigButtonSize = 80
  const smallButtonSize = 60

  const bigStartButton = (
    <Icon
      name="play-circle"
      size={bigButtonSize}
      color="red"
      style={styles.button}
      onPress={() => {
        start()
      }}
    />
  )

  const smallStartButton = (
    <Icon
      name="play-circle"
      size={smallButtonSize}
      color="red"
      style={styles.button}
      onPress={() => {
        resume()
      }}
    />
  )

  const pauseButton = (
    <Icon
      name="pause-circle"
      size={smallButtonSize}
      color="orange"
      style={styles.button}
      onPress={() => {
        pause()
      }}
    />
  )

  const stopButton = (
    <Icon
      name="stop-circle"
      size={smallButtonSize}
      color="black"
      style={styles.button}
      onPress={() => {
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
      <View style={{ flex: 3 }}>
        <Button title="Placeholder" onPress={() => {}} />
      </View>
      <View style={styles.buttonsView}>{renderButtons()}</View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  rowButton: {
    flexDirection: 'row',
    alignContent: 'space-between',
  },
  buttonsView: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  button: {
    padding: 30,
  },
})
