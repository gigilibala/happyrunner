import { useContext, useEffect, useReducer, useState } from 'react'
import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
  Permission,
  PermissionStatus,
  PermissionsAndroid,
  Platform,
} from 'react-native'
import BleManager, {
  Peripheral,
  PeripheralInfo,
} from 'react-native-ble-manager'
import { PreferencesContext } from '../components/providers/PreferencesProvider'

const HEART_RATE_GATT_SERVICE = '180d'
const HEART_RATE_GATT_CHARACTERISTIC = '2a37'

export interface Device {
  id: string
  name?: string
}

type Action =
  | { type: 'initialize' | 'scan' | 'stopScan' | 'disconnect' | 'connect' }
  | { type: 'addDevice'; payload: { device: Device } }
  | { type: 'setDevice'; payload: { device: Device } }
  | { type: 'success'; payload: 'connected' | 'idle' }
  | { type: 'enable'; payload: boolean }
  | { type: 'failure'; error: Error }
  | { type: 'heartRate'; payload: { heartRate: number } }
type State = {
  status: 'idle' | 'scanning' | 'connected'
  isLoading: boolean
  error?: Error
  // Means we got both permission and bluetooth is ON.
  enabled: boolean
  device?: Device
  devices: Device[]
  heartRate?: number
}

export function useHeartRateMonitor(): [State, React.Dispatch<Action>] {
  const [bleManagerEmitter, setBleManagerEmitter] =
    useState<NativeEventEmitter>()

  const [stateSubscription, setStateSubscription] =
    useState<EmitterSubscription>()
  const [scanningSubscription, setScanningSubscription] =
    useState<EmitterSubscription>()
  const [valueSubscription, setValueSubscription] =
    useState<EmitterSubscription>()

  const { usePrefState } = useContext(PreferencesContext)
  const [deviceOnStorage, setDeviceOnStorage] = usePrefState('hrmDevice')

  const [state, dispatch] = useReducer(
    (state: State, action: Action): State => {
      switch (action.type) {
        case 'initialize':
          if (!state.enabled && !bleManagerEmitter) {
            console.log('Initializing Bluetooth.')
            setBleManagerEmitter(
              new NativeEventEmitter(NativeModules.BleManager),
            )
          }
          return state
        case 'enable':
          return { ...state, enabled: action.payload }
        case 'scan':
          if (!state.enabled || state.status === 'scanning') return state
          startScan()
          return { ...state, status: 'scanning', isLoading: false }
        case 'stopScan':
          if (!state.enabled || state.status !== 'scanning') return state
          stopScan()
          return { ...state, status: 'idle', isLoading: false, devices: [] }
        case 'addDevice':
          if (
            state.devices.find(
              (device) => device.id === action.payload.device.id,
            )
          )
            return state
          console.log('Discovered new device: ', action.payload.device)
          return {
            ...state,
            devices: [...state.devices, action.payload.device],
          }
        case 'setDevice':
          return { ...state, device: action.payload.device }
        case 'connect':
          if (
            !state.enabled ||
            state.isLoading ||
            !state.device ||
            state.status === 'connected'
          )
            return state
          connect(state.device)
            .then(() => dispatch({ type: 'success', payload: 'connected' }))
            .catch((error) => dispatch({ type: 'failure', error: error }))
          return { ...state, isLoading: true }
        case 'disconnect':
          if (!state.enabled || state.isLoading || !state.device) return state
          disconnect(state.device).finally(() =>
            dispatch({ type: 'success', payload: 'idle' }),
          )
          return { ...state, isLoading: true }
        case 'success':
          return {
            ...state,
            status: action.payload,
            isLoading: false,
          }
        case 'failure':
          console.log(action.error)
          return {
            ...state,
            status: 'idle',
            isLoading: false,
          }
        case 'heartRate':
          return { ...state, heartRate: action.payload.heartRate }
      }
    },
    {
      status: 'idle',
      isLoading: false,
      enabled: false,
      device: deviceOnStorage,
      devices: [],
    },
  )

  useEffect(() => {
    if (state.status === 'scanning') {
      return () => dispatch({ type: 'stopScan' })
    }
    if (state.status === 'connected') {
      return () => dispatch({ type: 'disconnect' })
    }
  }, [state.status])

  useEffect(() => {
    if (state.device !== undefined) {
      setDeviceOnStorage(state.device)
    }
  }, [state.device])

  useEffect(() => {
    if (bleManagerEmitter === undefined) return

    requestPermission()
      .then(() => {
        console.log('User authorized Bluetooth permissions.')
        watchBluetoothStateChange()
        BleManager.checkState()
      })
      .catch((error) => {
        console.log('Failed to request for permission: ', error)
        dispatch({ type: 'enable', payload: false })
      })
  }, [bleManagerEmitter])

  useEffect(() => {
    if (stateSubscription)
      return () => {
        console.log('Unsubscribing to Bluetooth state changes.')
        stateSubscription.remove()
      }
  }, [stateSubscription])

  function watchBluetoothStateChange() {
    console.log('Subscribing to Bluetooth state changes.')
    setStateSubscription(
      bleManagerEmitter?.addListener(
        'BleManagerDidUpdateState',
        ({ state }: { state: string }) => {
          switch (state) {
            case 'off':
              console.log('Bluetooth is Off')
              BleManager.enableBluetooth().catch((error) => {
                console.log('Failed to enable Bluetooth: ', error)
                dispatch({ type: 'enable', payload: false })
              })
              break
            case 'on':
              console.log('Bluetooth is On')
              dispatch({ type: 'enable', payload: true })
              break
            default:
              break
          }
        },
      ),
    )
  }

  function requestPermission(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (Platform.OS === 'android') {
        const bluetoothPermissions: Permission[] = [
          'android.permission.BLUETOOTH_CONNECT',
          'android.permission.BLUETOOTH_SCAN',
          'android.permission.ACCESS_FINE_LOCATION',
        ]
        PermissionsAndroid.requestMultiple(bluetoothPermissions).then(
          (result) => {
            const permission = bluetoothPermissions.reduce<PermissionStatus>(
              (prev, cur) => prev && result[cur],
              'granted',
            )
            switch (permission) {
              case 'granted':
                resolve()
              case 'denied':
              case 'never_ask_again':
              default:
                reject('Access denied')
            }
          },
        )
      } else {
        // TODO(gigilibala): Request bluetooth for iOS (if needed).
      }
    })
  }

  function startScan() {
    BleManager.scan([], 60, false)
      .then(() => {
        console.log('Started scanning for BLE devices.')
        setScanningSubscription(
          bleManagerEmitter?.addListener(
            'BleManagerDiscoverPeripheral',
            (device: Peripheral) => {
              if (
                device.advertising.serviceUUIDs?.includes(
                  HEART_RATE_GATT_SERVICE,
                ) ||
                device.advertising.serviceUUIDs?.includes(
                  HEART_RATE_GATT_SERVICE,
                )
              ) {
                dispatch({ type: 'addDevice', payload: { device } })
              }
            },
          ),
        )
      })
      .catch((error) => console.log('Failed to scan for BLE devices: ', error))
  }

  function stopScan() {
    BleManager?.stopScan()
      .then(() => {
        console.log('Stopped scanning for BLE devices.')
      })
      .catch((error) =>
        console.log('Failed to stop scanning for BLE devices: ', error),
      )
      .finally(() => {
        scanningSubscription?.remove()
      })
  }

  function connect(device: Device) {
    return BleManager.connect(device.id)
      .then(() => {
        console.log('Connected to device: ', device.id)
        return BleManager.retrieveServices(device.id)
      })
      .then((info) => startReadingData(info))
  }

  function disconnect(device: Device) {
    return new Promise<void>((resolve, reject) => {
      if (device === undefined) {
        resolve()
        return
      }
      BleManager.disconnect(device.id)
        .then(() => {
          console.log('Disconnected from device: ', device)
        })
        .catch((error) =>
          console.log(
            'Failed to disconnect from device, forcing disconnection!',
          ),
        )
        .finally(() => {
          valueSubscription?.remove()
          resolve()
        })
    })
  }

  function startReadingData(info: PeripheralInfo): Promise<void> {
    return BleManager.startNotification(
      info.id,
      HEART_RATE_GATT_SERVICE,
      HEART_RATE_GATT_CHARACTERISTIC,
    ).then(() => {
      console.log('Bluetooth notification started.')
      setValueSubscription(
        bleManagerEmitter?.addListener(
          'BleManagerDidUpdateValueForCharacteristic',
          (event) => onHeartRateUpdate(event),
        ),
      )
    })
  }

  function onHeartRateUpdate({ value: bytes }: any) {
    if (!bytes) {
      console.log('No value read!')
      return
    }

    let idx = 0
    const details = {
      heartRateFormat: bytes[idx] & 0x01,
      sensorContactDetected: (bytes[idx] & 0x02) >> 1,
      sensorContactSupport: (bytes[idx] & 0x04) >> 2,
      energyExtended: (bytes[idx] & 0x08) >> 3,
      rrIntervalPresent: (bytes[idx] & 0x10) >> 4,
      dataLength: bytes.length,
      heartRate: 0,
    }
    idx++

    details.heartRate = bytes[idx++]
    if (details.heartRateFormat !== 0) {
      details.heartRate = (details.heartRate << 8) + bytes[idx++]
    }

    const rrIntervals = Array<number>()
    for (; idx < bytes.length; ) {
      const value = bytes[idx++] + (bytes[idx++] << 8)
      rrIntervals.push((value / 1024) * 1000)
    }

    // const moreDetails = { ...details, rrIntervals }
    // setHeartRate(JSON.stringify(moreDetails, null, 2))
    dispatch({ type: 'heartRate', payload: { heartRate: details.heartRate } })
  }

  return [state, dispatch]
}
