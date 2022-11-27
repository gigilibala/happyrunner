import { Theme } from '@react-navigation/native'
import { useContext } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { useStyles } from '../common/styles'
import { HeartRateMonitorContext } from '../hooks/HeartRateMonitorProvider'

export default function HeartRate() {
  const styles = useStyles(createStyles)
  const { heartRate } = useContext(HeartRateMonitorContext)

  return (
    <View style={styles.box}>
      {heartRate ? (
        <Text style={styles.mediumText}>{heartRate}</Text>
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
