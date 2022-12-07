import { Dispatch, useContext, useEffect, useReducer, useState } from 'react'
import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
  Permission,
  PermissionsAndroid,
  PermissionStatus,
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

interface IHeartRateMonitorApi {
  bluetoothEnabled: boolean
  devices: Device[]
  device?: Device
  heartRate?: number
  state: State
  dispatch: Dispatch<Action>
}

type Action =
  | { type: 'scan' | 'stopScan' | 'disconnect' }
  | { type: 'connect'; payload?: { device: Device } }
  | { type: 'success' }
  | { type: 'failure'; error: Error }
type State = {
  status: 'idle' | 'scanning' | 'connected'
  isLoading: boolean
  error?: Error
}

export function useHeartRateMonitor(): IHeartRateMonitorApi {
  const [bleManagerEmitter, setBleManagerEmitter] =
    useState<NativeEventEmitter>(
      new NativeEventEmitter(NativeModules.BleManager),
    )

  const [stateSubscription, setStateSubscription] =
    useState<EmitterSubscription>()
  const [bluetoothEnabled, setBluetoothEnabled] = useState<boolean>(true)
  const [scanningSubscription, setScanningSubscription] =
    useState<EmitterSubscription>()
  const [devices, setDevices] = useState<Device[]>([])
  const [valueSubscription, setValueSubscription] =
    useState<EmitterSubscription>()
  const [heartRate, setHeartRate] = useState<number>()

  const { usePrefState } = useContext(PreferencesContext)
  const [device, setDevice] = usePrefState('hrmDevice')

  const [state, dispatch] = useReducer(
    (state: State, action: Action): State => {
      switch (action.type) {
        case 'scan':
          if (state.status === 'scanning') return state
          startScan()
          return { status: 'scanning', isLoading: false }
        case 'stopScan':
          if (state.status !== 'scanning') return state
          stopScan()
          return { status: 'idle', isLoading: false }
        case 'connect':
          if (state.status === 'connected' || state.isLoading) return state
          connect(action.payload?.device.id)
            .then(() => dispatch({ type: 'success' }))
            .catch((error) => {
              console.log(error)
              dispatch({ type: 'failure', error: error })
            })
          state = { ...state }
          state.isLoading = true
          return state
        case 'disconnect':
          if (state.status !== 'connected' || !state.isLoading) return state
          disconnect().finally(() => dispatch({ type: 'success' }))
          return state
        case 'success':
          return {
            status: state.isLoading ? 'connected' : 'idle',
            isLoading: false,
          }
        case 'failure':
          return {
            status: 'idle',
            isLoading: false,
          }
      }
    },
    { status: 'idle', isLoading: false },
  )

  useEffect(() => {
    if (state.status === 'scanning') {
      return () => dispatch({ type: 'stopScan' })
    }
    if (state.status === 'connected') {
      return () => dispatch({ type: 'disconnect' })
    }
  }, [state])

  useEffect(() => {
    // TODO(gigilibala): Remove
    const handle = setInterval(
      () => setHeartRate(Math.floor(Math.random() * 200)),
      2000,
    )
    setDevices([
      { name: 'amin', id: 'amin' },
      { name: 'hassani', id: 'hassani' },
    ])

    return () => {
      clearInterval(handle)
    }
  }, [])

  useEffect(() => {
    watchBluetoothStateChange()
    BleManager.checkState()
    return () => {
      console.log('Unsubscribing to bluetooth state changes.')
      stateSubscription?.remove()
    }
  }, [bleManagerEmitter])

  function watchBluetoothStateChange() {
    console.log('Subscribing to bluetooth state changes.')
    setStateSubscription(
      bleManagerEmitter?.addListener(
        'BleManagerDidUpdateState',
        ({ state }: { state: string }) => {
          switch (state) {
            case 'off':
              BleManager.enableBluetooth().catch((error) => {
                console.log('Failed to enable bluetooth: ', error)
                setBluetoothEnabled(false)
              })
              break
            case 'on':
              requestPermission()
                .then(() => {
                  setBluetoothEnabled(true)
                })
                .catch((error) => {
                  console.log('Failed to request for permission: ', error)
                  setBluetoothEnabled(false)
                })
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
                setDevices((prev: Device[]): Device[] => {
                  if (prev.some((d) => d.id === device.id)) {
                    return prev
                  }
                  console.log('Discovered new device: ', device)
                  return [...prev, device]
                })
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
        setDevices([])
      })
      .catch((error) =>
        console.log('Failed to stop scanning for BLE devices: ', error),
      )
      .finally(() => scanningSubscription?.remove())
  }

  function connect(id?: string) {
    return new Promise<void>((resolve, reject) => {
      if (id !== undefined) {
        const d = devices.find((p) => p.id === id)
        if (d === undefined) {
          reject('Trying to connect to a device that we have never found!')
          return
        }
        setDevice({ id: d.id, name: d.name })
      } else {
        id = device?.id
      }
      if (id === undefined) {
        reject('No device is available.')
        return
      }
      BleManager.connect(id)
        .then(() => {
          console.log('Connected to device: ', id)
          return BleManager.retrieveServices(id!)
        })
        .then((info) => startReadingData(info))
        .then(() => resolve())
        .catch((error) => {
          reject(`Failed to connect to device: ${id}, ${error}`)
        })
    })
  }

  function disconnect() {
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
    setHeartRate(details.heartRate)
  }

  return {
    bluetoothEnabled,
    devices,
    device,
    heartRate,
    state,
    dispatch,
  }
}
