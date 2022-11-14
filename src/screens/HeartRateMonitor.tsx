import { useContext } from 'react'
import { Button, SafeAreaView, StyleSheet, View } from 'react-native'
import HeartRate from '../components/HeartRate'
import { Props } from '../components/navigators/SettingsStack'
import { BluetoothContext } from '../hooks/BluetoothProvider'

export function HeartRateMonitor({ navigation }: Props<'Heart Rate Monitor'>) {
  const { scanForDevices, connectToDevice } = useContext(BluetoothContext)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.plot}>
        <HeartRate />
      </View>
      <View style={styles.actions}>
        <View style={styles.button}>
          <Button
            title="Scan"
            onPress={() => {
              scanForDevices()
              navigation.navigate('Scan Bluetooth')
            }}
          />
        </View>
        <View style={styles.button}>
          <Button
            title="Connect"
            onPress={() => {
              connectToDevice().catch((error) => {
                console.log(`Failed connecting to device ${error}`)
              })
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  plot: {
    flex: 6,
    // justifyContent: 'center',
    // alignItems: 'center',
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
