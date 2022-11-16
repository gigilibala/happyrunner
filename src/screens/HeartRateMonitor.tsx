import { Theme, useTheme } from '@react-navigation/native'
import { useContext, useMemo } from 'react'
import { Button, SafeAreaView, StyleSheet, View } from 'react-native'
import HeartRate from '../components/HeartRate'
import { Props } from '../components/navigators/SettingsStack'
import { BluetoothContext } from '../hooks/BluetoothProvider'

export function HeartRateMonitor({ navigation }: Props<'Heart Rate Monitor'>) {
  const theme = useTheme()
  const styles = useMemo(() => createStyles(theme), [theme])

  const { setStatus } = useContext(BluetoothContext)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.plot}>
        <HeartRate />
      </View>
      <View style={styles.actions}>
        <View style={styles.button}>
          <Button
            title="Scan"
            onPress={() => navigation.navigate('Scan Bluetooth')}
          />
        </View>
        <View style={styles.button}>
          <Button title="Connect" onPress={() => setStatus('connecting')} />
        </View>
      </View>
    </SafeAreaView>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    plot: {
      flex: 6,
    },
    actions: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
    },
    button: {
      width: '40%',
      height: 40,
    },
  })
