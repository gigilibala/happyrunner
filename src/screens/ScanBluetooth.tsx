import { useFocusEffect } from '@react-navigation/native'
import { useContext, useEffect } from 'react'
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { Props } from '../components/navigators/SettingsStack'
import { BluetoothContext } from '../hooks/BluetoothProvider'

export function ScanBluetooth({ navigation }: Props<'Scan Bluetooth'>) {
  const { allDevices, connectedDevice, setStatus, setDeviceId } =
    useContext(BluetoothContext)

  useEffect(() => {
    setStatus('scanning')
  }, [])

  // TODO(gigilibala): Add an effect to go back when a device is connected.
  // connectToDevice(device.id)
  //   .then(() => {
  //     navigation.goBack()
  //   })
  //   .catch((reason) => {
  //     console.log(`Filed to connect: ${reason}`)
  //   })

  // const dummyDevices: Array<{
  //   name: string
  // }> = [{ name: 'Amin' }, { name: 'Hassani' }]
  // TODO(gigilibala): Uncomment.
  // scanForDevices()

  return (
    <SafeAreaView style={styles.container}>
      {allDevices.length !== 0 ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          {allDevices.map((device) => {
            return (
              <TouchableOpacity
                onPress={() => {
                  setDeviceId(device.id)
                  setStatus('connecting')
                }}
                key={device.name}
              >
                <View style={styles.device}>
                  <Text style={styles.deviceName}>{device.name}</Text>
                  {connectedDevice?.id === device.id && (
                    <View>
                      <Text style={{ fontSize: 15, opacity: 0.6 }}>
                        connected!
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      ) : (
        <ActivityIndicator size={'large'} />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  scroll: {
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
  },
  device: {
    justifyContent: 'center',
  },
  deviceName: {
    fontSize: 20,
    padding: 20,
  },
})
