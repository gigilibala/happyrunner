import { Theme } from '@react-navigation/native'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { PreferencesContext } from '../../components/providers/PreferencesProvider'
import { useHeartRateMonitor } from '../../hooks/heartRateMonitor'
import { useStyles } from '../../hooks/styles'
import { SettingsScreenProps } from '../RootNavigator'

const ICON_SIZE = 20

export function HeartRateMonitorSettings({
  navigation,
}: SettingsScreenProps<'HeartRateMonitorSettings'>) {
  const styles = useStyles(createStyles)
  const { t } = useTranslation()
  const [backgroundOpacity, setBackgroundOpacity] = useState<number>(1)

  const [state, dispatch] = useHeartRateMonitor()

  const { usePrefState } = useContext(PreferencesContext)
  const [device] = usePrefState('hrmDevice')

  useEffect(() => {
    dispatch({ type: 'initialize' })
  }, [])

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => dispatch({ type: 'scan' })}
          disabled={!state.enabled}
        >
          <Icon
            name={'search'}
            size={ICON_SIZE}
            color={state.enabled ? 'blue' : 'grey'}
            style={[styles.icon, { opacity: backgroundOpacity }]}
          />
        </TouchableOpacity>
      ),
    })
  }, [state.enabled])

  function connectButtonTitle(): string {
    switch (state.status) {
      case 'connected':
        return t('disconnect')
      case 'idle':
        return t('connect')
      default:
        return '...'
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
          {state.heartRate ? (
            <Text style={styles.mediumText}>{state.heartRate}</Text>
          ) : (
            <ActivityIndicator />
          )}
        </View>
      </View>
    </View>
  )

  const [showModal, setShowModal] = useState<boolean>(false)
  useEffect(() => {
    if (state.status === 'scanning') setShowModal(true)
  }, [state.status])
  useEffect(() => {
    if (showModal) {
      setBackgroundOpacity(0.25)
      return () =>
        dispatch({
          type: 'stopScan',
        })
    } else {
      setBackgroundOpacity(1.0)
    }
  }, [showModal])

  const scanModal = (
    <Modal
      animationType={'fade'}
      visible={showModal}
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={() => setShowModal(false)}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, styles.shadow]}>
          <View style={styles.card}>
            <Text style={styles.mediumText}>{t('scanning')}</Text>
          </View>
          <ScrollView>
            {state.devices.map((device) => (
              <TouchableOpacity
                key={device.id}
                onPress={() => {
                  dispatch({
                    type: 'setDevice',
                    payload: { device: device },
                  })
                  setShowModal(false)
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
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowModal(false)}
          >
            <Text style={styles.buttonText}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

  const connectButton = (
    <TouchableOpacity
      style={styles.button}
      onPress={() =>
        dispatch({
          type: state.status === 'connected' ? 'disconnect' : 'connect',
        })
      }
      disabled={!state.enabled || state.isLoading || !state.device}
    >
      <Text style={styles.buttonText}>{connectButtonTitle()}</Text>
    </TouchableOpacity>
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
