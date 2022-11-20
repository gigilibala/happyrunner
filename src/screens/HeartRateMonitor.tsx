import { Theme, useTheme } from '@react-navigation/native'
import { useContext, useEffect, useMemo, useState } from 'react'
import {
  Button,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { HeartRateMonitorContext } from '../hooks/HeartRateMonitorProvider'
import { Props } from './navigators/SettingsStack'

function BluetoothIcon() {
  return (
    <Icon
      name={'bluetooth-b'}
      color={'blue'}
      size={20}
      style={{ padding: 10 }}
    />
  )
}

export function HeartRateMonitor({
  navigation,
  route,
}: Props<'Heart Rate Monitor'>) {
  const theme = useTheme()
  const styles = useMemo(() => createStyles(theme), [theme])

  const {
    setDoWatchStateChange,
    bluetoothEnabled,
    setIsScanning,
    devices,
    device,
    setDevice,
    setDoConnect,
    connectionStatus,
    heartRate,
  } = useContext(HeartRateMonitorContext)
  const [scanVisible, setScanVisible] = useState<boolean>(false)

  useEffect(() => {
    setDoWatchStateChange(true)
    return () => {
      setIsScanning(false)
      setDoConnect(false)
      setDoWatchStateChange(false)
    }
  }, [])

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setScanVisible(true)}
          disabled={!bluetoothEnabled}
        >
          <Icon
            name={'search'}
            size={20}
            color={bluetoothEnabled ? 'blue' : 'grey'}
          ></Icon>
        </TouchableOpacity>
      ),
    })
  }, [bluetoothEnabled])

  useEffect(() => {
    setIsScanning(scanVisible)
  }, [scanVisible])

  // TODO(gigilibala): Remove
  // const devices = [
  //   { name: 'amin', id: 'amin' },
  //   { name: 'hassani', id: 'hassani' },
  // ]

  function connectButtonTitle(): string {
    switch (connectionStatus) {
      case 'connected':
        return 'Disconnect'
      case 'connecting':
        return 'Connecting...'
      case 'disconnecting':
        return 'Disconnecting...'
      case 'not-connected':
        return 'Connect'
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hrmInfo}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <BluetoothIcon />
          <View>
            <Text style={[styles.text]}>{device?.name}</Text>
          </View>
        </View>
        <View>
          <Text style={[styles.text]}>{heartRate}</Text>
        </View>
      </View>

      <Modal
        animationType={'fade'}
        visible={scanVisible}
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => setScanVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView]}>
            <View
              style={{
                borderWidth: 1,
                borderColor: 'green',
                padding: 10,
                alignItems: 'center',
              }}
            >
              <Text
                style={[
                  styles.text,
                  { color: theme.colors.primary, fontWeight: 'bold' },
                ]}
              >
                Devices
              </Text>
            </View>
            <ScrollView>
              {devices.map((device) => (
                <TouchableOpacity
                  key={device.id}
                  onPress={() => {
                    setScanVisible(false)
                    setDevice({ id: device.id, name: device.name })
                    setDoConnect(true)
                  }}
                  style={{
                    borderColor: 'black',
                    borderWidth: 1,
                    padding: 10,
                  }}
                >
                  <View style={{ flexDirection: 'row' }}>
                    <BluetoothIcon />
                    <Text
                      style={[
                        styles.text,
                        {
                          fontSize: 30,
                        },
                      ]}
                    >
                      {device.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button
              title={'Cancel'}
              onPress={() => {
                setScanVisible(false)
              }}
            ></Button>
          </View>
        </View>
      </Modal>

      <View style={styles.button}>
        <Button
          title={connectButtonTitle()}
          onPress={() => setDoConnect(connectionStatus === 'not-connected')}
          disabled={
            !bluetoothEnabled ||
            connectionStatus === 'connecting' ||
            connectionStatus === 'disconnecting'
          }
        />
      </View>
    </SafeAreaView>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    text: {
      color: theme.colors.text,
      fontSize: 20,
    },
    hrmInfo: {
      flexDirection: 'row',
      backgroundColor: theme.colors.card,
      margin: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
      borderColor: 'red',
      borderWidth: 1,
    },

    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
    },
    modalView: {
      width: '80%',
      height: '50%',
      borderWidth: 1,
      borderColor: 'red',
      backgroundColor: theme.colors.card,
      borderRadius: 10,
      shadowColor: 'black',
      shadowOffset: {
        width: 2,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 0.5,
      elevation: 20,
    },
    button: {
      margin: 10,
      elevation: 2,
    },
  })
