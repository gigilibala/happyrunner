import { Theme, useTheme } from '@react-navigation/native'
import React, { useContext, useMemo } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { BluetoothContext } from '../hooks/BluetoothProvider'

export default function HeartRate() {
  const theme = useTheme()
  const styles = useMemo(() => createStyles(theme), [theme])

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

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    box: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      width: 100,
      height: 100,
    },
    text: {
      color: theme.colors.primary,
      textAlign: 'center',
      fontSize: 40,
    },
  })
