import { useAsyncStorage } from '@react-native-async-storage/async-storage'
import { createContext, ReactNode, useEffect, useState } from 'react'
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

const HEART_RATE_GATT_SERVICE = '180d'
const HEART_RATE_GATT_CHARACTERISTIC = '2a37'

type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnecting'
  | 'not-connected'

type Device = {
  id: string
  name?: string
}

interface IHeartRateMonitorApi {
  setDoWatchStateChange: (watch: boolean) => void
  bluetoothEnabled: boolean
  setIsScanning: (scan: boolean) => void
  devices: Peripheral[]
  device?: Device
  setDevice: (device: Device) => void
  setDoConnect: (connect: boolean) => void
  connectionStatus: ConnectionStatus
  heartRate?: number
}

function useHeartRateMonitor() {
  const [initialized, setInitialized] = useState<boolean>(false)
  const [bleManagerEmitter, setBleManagerEmitter] =
    useState<NativeEventEmitter>()

  const [doWatchStateChange, setDoWatchStateChange] = useState<boolean>(false)
  const [stateSubscription, setStateSubscription] =
    useState<EmitterSubscription>()
  const [bluetoothEnabled, setBluetoothEnabled] = useState<boolean>(true)
  const [isScanning, setIsScanning] = useState<boolean>(false)
  const [scanningSubscription, setScanningSubscription] =
    useState<EmitterSubscription>()
  const [devices, setDevices] = useState<Peripheral[]>([])
  const [doConnect, setDoConnect] = useState<boolean>(false)
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('not-connected')
  const [device, setDevice] = useState<Device>()
  const { setItem, getItem } = useAsyncStorage('@bluetooth_default_device')
  const [valueSubscription, setValueSubscription] =
    useState<EmitterSubscription>()
  const [heartRate, setHeartRate] = useState<number>()

  useEffect(() => {
    BleManager.start().then(() => {
      setInitialized(true)
      console.log('Bluetooth module initialized.')
    })

    setBleManagerEmitter(new NativeEventEmitter(NativeModules.BleManager))
  }, [])

  useEffect(() => {
    if (doWatchStateChange) {
      watchBluetoothStateChange()
      return () => setStateSubscription(undefined)
    }
  }, [doWatchStateChange])

  useEffect(() => {
    if (stateSubscription !== undefined) {
      BleManager.checkState()
      return () => {
        console.log('Unsubscribing to bluetooth state changes.')
        stateSubscription.remove()
      }
    }
  }, [stateSubscription])

  useEffect(() => {
    if (isScanning) {
      startScan()
      return () => stopScan()
    }
  }, [isScanning])

  useEffect(() => {
    if (scanningSubscription !== undefined)
      return () => scanningSubscription.remove()
  }, [scanningSubscription])

  useEffect(() => {
    if (valueSubscription !== undefined) return () => valueSubscription.remove()
  }, [valueSubscription])

  useEffect(() => {
    if (device === undefined) {
      getItem()
        .then((value) => {
          if (value !== null) {
            setDevice(JSON.parse(value) as Device)
          }
        })
        .catch((error) => console.error('Failed to read the storage.'))
    } else {
      setItem(JSON.stringify(device))
        .then(() => console.log('Wrote device info into storage!: ', device))
        .catch((error) => console.log('Failed to write to store.'))
    }
  }, [device])

  useEffect(() => {
    if (doConnect) {
      connect()
      return () => disconnect()
    }
  }, [doConnect])

  function watchBluetoothStateChange() {
    console.log('Subscribing to bluetooth state changes.')
    setStateSubscription(
      bleManagerEmitter?.addListener(
        'BleManagerDidUpdateState',
        ({ state }: { state: string }) => {
          console.log('herere  ', state)
          switch (state) {
            case 'off':
              BleManager.enableBluetooth().catch((error) => {
                console.log('error ', error)
                setBluetoothEnabled(false)
              })
              break
            case 'on':
              requestPermission()
                .then(() => {
                  setBluetoothEnabled(true)
                })
                .catch((error) => {
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
                setDevices((prev: Peripheral[]): Peripheral[] => {
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
    BleManager.stopScan()
      .then(() => {
        console.log('Stopped scanning for BLE devices.')
        setDevices([])
      })
      .catch((error) =>
        console.log('Failed to stop scanning for BLE devices: ', error),
      )
  }

  function connect(id?: string) {
    if (id !== undefined) {
      const d = devices.find((p) => p.id === id)
      if (d === undefined) {
        console.log('Trying to connect to a device that we have never found!')
        return
      }
      setDevice({ id: d.id, name: d.name })
    } else {
      id = device?.id
    }
    if (id === undefined) return
    setConnectionStatus('connecting')
    BleManager.connect(id)
      .then(() => {
        console.log('Connected to device: ', id)
        setConnectionStatus('connected')
        return BleManager.retrieveServices(id!)
      })
      .then((info) => {
        // console.log(JSON.stringify(info, undefined, 2))
        startReadingData(info)
      })
      .catch((error) => {
        console.log('Failed to connect to device: ', id, error)
        setConnectionStatus('not-connected')
      })
  }

  function disconnect() {
    if (device === undefined) return
    setConnectionStatus('disconnecting')
    BleManager.disconnect(device.id)
      .then(() => {
        console.log('Disconnected from device: ', device)
        setConnectionStatus('not-connected')
      })
      .catch((error) => {
        console.log('Failed to disconnect from device, forcing disconnection!')
        setConnectionStatus('not-connected')
      })
  }

  function startReadingData(info: PeripheralInfo) {
    BleManager.startNotification(
      info.id,
      HEART_RATE_GATT_SERVICE,
      HEART_RATE_GATT_CHARACTERISTIC,
    )
      .then(() => {
        console.log('Notification started.')
        setValueSubscription(
          bleManagerEmitter?.addListener(
            'BleManagerDidUpdateValueForCharacteristic',
            (event: any) => onHeartRateUpdate(event),
          ),
        )
      })
      .catch((error) => {
        setConnectionStatus('not-connected')
        console.log('Failed to start the notification: ', error)
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
    setDoWatchStateChange,
    bluetoothEnabled,
    setIsScanning,
    devices,
    device,
    setDevice,
    setDoConnect,
    connectionStatus,
    heartRate,
  }
}

export const HeartRateMonitorContext = createContext<IHeartRateMonitorApi>(
  {} as IHeartRateMonitorApi,
)

export function HeartRateMonitorProvider({
  children,
}: {
  children: ReactNode
}) {
  const state = useHeartRateMonitor()

  return (
    <HeartRateMonitorContext.Provider value={state}>
      {children}
    </HeartRateMonitorContext.Provider>
  )
}
