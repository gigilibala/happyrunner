import { Theme } from '@react-navigation/native'
import { useContext, useEffect } from 'react'
import {
  ActivityIndicator,
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
import { useStyles } from '../common/styles'
import { HeartRateMonitorContext } from '../hooks/HeartRateMonitorProvider'
import { Props } from './navigators/RootNavigator'

const ICON_SIZE = 20

export function HeartRateMonitor({
  navigation,
  route,
}: Props<'Heart Rate Monitor'>) {
  const styles = useStyles(createStyles)

  const {
    setDoWatchStateChange,
    bluetoothEnabled,
    isScanning,
    setIsScanning,
    devices,
    device,
    setDevice,
    setDoConnect,
    connectionStatus,
    heartRate,
  } = useContext(HeartRateMonitorContext)

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
          onPress={() => setIsScanning(true)}
          disabled={!bluetoothEnabled}
        >
          <Icon
            name={'search'}
            size={ICON_SIZE}
            color={bluetoothEnabled ? 'blue' : 'grey'}
            style={[styles.icon, { opacity: opacity(!isScanning) }]}
          />
        </TouchableOpacity>
      ),
    })
  }, [bluetoothEnabled])

  const opacity = (visible: boolean) => (visible ? 1.0 : 0.25)

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

  const hrmInfo = (
    <View style={[styles.card, styles.hrmInfo]}>
      <View style={styles.iconWithText}>
        <Icon
          name={'bluetooth-b'}
          color={'blue'}
          size={ICON_SIZE}
          style={styles.icon}
        />

        <View>
          <Text style={styles.text}>{device ? device.name : '?'}</Text>
        </View>
      </View>
      <View style={styles.iconWithText}>
        <Icon
          name={'heartbeat'}
          color={'red'}
          size={ICON_SIZE}
          style={styles.icon}
        />
        <View>
          {heartRate ? (
            <Text style={styles.text}>{heartRate}</Text>
          ) : (
            <ActivityIndicator />
          )}
        </View>
      </View>
    </View>
  )

  const scanModal = (
    <Modal
      animationType={'fade'}
      visible={isScanning}
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={() => setIsScanning(false)}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.card}>
            <Text style={styles.text}>Scanning</Text>
          </View>
          <ScrollView>
            {devices.map((device) => (
              <TouchableOpacity
                key={device.id}
                onPress={() => {
                  setIsScanning(false)
                  setDevice({ id: device.id, name: device.name })
                  setDoConnect(true)
                }}
              >
                <View style={styles.iconWithText}>
                  <Icon
                    name={'bluetooth-b'}
                    color={'blue'}
                    size={ICON_SIZE}
                    style={styles.icon}
                  />
                  <Text style={styles.largeText}>{device.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.button}>
            <Button
              title={'Cancel'}
              onPress={() => {
                setIsScanning(false)
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  )

  const connectButton = (
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
  )

  return (
    <SafeAreaView
      style={[
        styles.safeAreaView,
        styles.container,
        { opacity: opacity(!isScanning) },
      ]}
    >
      {hrmInfo}
      {scanModal}
      {connectButton}
    </SafeAreaView>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    hrmInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
      backgroundColor: theme.colors.card,
      borderRadius: 5,
      shadowColor: 'black',
      shadowOffset: {
        width: 2,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 0.5,
      elevation: 10,
    },
    iconWithText: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    icon: {
      padding: 10,
    },
  })
