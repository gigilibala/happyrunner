import { useEffect, useState } from 'react'
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
import usePrefs from '../common/prefs'

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
  bluetoothEnabled: boolean
  isScanning: boolean
  setIsScanning: (scan: boolean) => void
  devices: Peripheral[]
  device?: Device
  setDevice: (device: Device) => void
  setDoConnect: (connect: boolean) => void
  connectionStatus: ConnectionStatus
  heartRate?: number
}

export function useHeartRateMonitor(): IHeartRateMonitorApi {
  const [bleManagerEmitter, setBleManagerEmitter] =
    useState<NativeEventEmitter>(
      new NativeEventEmitter(NativeModules.BleManager),
    )

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
  const [device, setDevice] = usePrefs<Device>('@bluetooth_default_device')
  const [valueSubscription, setValueSubscription] =
    useState<EmitterSubscription>()
  const [heartRate, setHeartRate] = useState<number>()

  useEffect(() => {
    // TODO(gigilibala): Remove
    const handle = setInterval(
      () => setHeartRate(Math.floor(Math.random() * 200)),
      2000,
    )
    setDevices([
      { name: 'amin', id: 'amin', advertising: {}, rssi: 1 },
      { name: 'hassani', id: 'hassani', advertising: {}, rssi: 1 },
    ])

    return () => clearInterval(handle)
  }, [])

  useEffect(() => {
    watchBluetoothStateChange()
    BleManager.checkState()
    return () => {
      console.log('Unsubscribing to bluetooth state changes.')
      stateSubscription?.remove()
    }
  }, [bleManagerEmitter])

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
    setScanningSubscription(undefined)
    BleManager?.stopScan()
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
      .then((info) => startReadingData(info))
      .catch((error) => {
        console.log('Failed to connect to device: ', id, error)
        setConnectionStatus('not-connected')
      })
  }

  function disconnect() {
    setValueSubscription(undefined)
    if (device === undefined) return
    setConnectionStatus('disconnecting')
    BleManager.disconnect(device.id)
      .then(() => console.log('Disconnected from device: ', device))
      .catch((error) =>
        console.log('Failed to disconnect from device, forcing disconnection!'),
      )
      .finally(() => {
        setConnectionStatus('not-connected')
      })
  }

  function startReadingData(info: PeripheralInfo): Promise<void> {
    return BleManager.startNotification(
      info.id,
      HEART_RATE_GATT_SERVICE,
      HEART_RATE_GATT_CHARACTERISTIC,
    ).then(() => {
      console.log('Notification started.')
      setValueSubscription(
        bleManagerEmitter?.addListener(
          'BleManagerDidUpdateValueForCharacteristic',
          (event: any) => onHeartRateUpdate(event),
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
    isScanning,
    setIsScanning,
    devices,
    device,
    setDevice,
    setDoConnect,
    connectionStatus,
    heartRate,
  }
}
