import React, { useContext } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { BluetoothContext } from '../hooks/BluetoothProvider'

export default function HeartRate() {
  const { heartRate } = useContext(BluetoothContext)

  return (
    <View style={styles.box}>
      {heartRate ? (
        <Text style={styles.text}>{heartRate}</Text>
      ) : (
        <ActivityIndicator size={'large'} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d1ee0f',
    borderRadius: 20,
    width: 100,
    height: 100,
  },
  text: {
    color: 'black',
    textAlign: 'center',
    fontSize: 40,
  },
})
