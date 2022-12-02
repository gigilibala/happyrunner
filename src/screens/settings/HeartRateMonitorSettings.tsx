import { Theme } from '@react-navigation/native'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { useStyles } from '../../common/styles'
import { useHeartRateMonitor } from '../../hooks/HeartRateMonitor'
import { SettingsScreenProps } from '../RootNavigator'

const ICON_SIZE = 20

export function HeartRateMonitorSettings({
  navigation,
}: SettingsScreenProps<'HeartRateMonitorSettings'>) {
  const styles = useStyles(createStyles)
  const { t } = useTranslation()
  const [backgroundOpacity, setBackgroundOpacity] = useState<number>(1)

  const {
    bluetoothEnabled,
    isScanning,
    setIsScanning,
    devices,
    device,
    setDevice,
    setDoConnect,
    connectionStatus,
    heartRate,
  } = useHeartRateMonitor()

  useEffect(() => {
    return () => {
      setIsScanning(false)
      setDoConnect(false)
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
            style={[styles.icon, { opacity: backgroundOpacity }]}
          />
        </TouchableOpacity>
      ),
    })
  }, [bluetoothEnabled])

  useEffect(() => {
    setBackgroundOpacity(isScanning ? 0.25 : 1.0)
  }, [isScanning])

  function connectButtonTitle(): string {
    switch (connectionStatus) {
      case 'connected':
        return t('disconnect')
      case 'connecting':
        return t('connecting')
      case 'disconnecting':
        return t('disconnecting')
      case 'not-connected':
        return t('connect')
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
          <Text style={styles.mediumText}>{device ? device.name : '?'}</Text>
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
            <Text style={styles.mediumText}>{heartRate}</Text>
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
        <View style={[styles.modalView, styles.shadow]}>
          <View style={styles.card}>
            <Text style={styles.mediumText}>{t('scanning')}</Text>
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
              title={t('cancel')}
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
        { opacity: backgroundOpacity },
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
    },
    iconWithText: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    icon: {
      padding: 10,
    },
  })
