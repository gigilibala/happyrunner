import { useAsyncStorage } from '@react-native-async-storage/async-storage'
import { Buffer } from 'buffer'
import { createContext, ReactNode, useEffect, useState } from 'react'
import {
  Permission,
  PermissionsAndroid,
  PermissionStatus,
  Platform,
} from 'react-native'
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from 'react-native-ble-plx'

const manager = new BleManager()

type Status = 'connecting' | 'disconnecting' | 'scanning'

interface IBluetoothApi {
  allDevices: Device[]
  connectedDevice?: Device
  heartRate: number
  setStatus: (status: Status) => void
  setDeviceId: (deviceId: string) => void
}

function useBluetooth(): IBluetoothApi {
  const [allDevices, setAllDevices] = useState<Device[]>([])
  const [deviceId, setDeviceId] = useState<string>()
  const [connectedDevice, setConnectedDevice] = useState<Device>()
  const [heartRate, setHeartRate] = useState<number>(0)
  const { setItem, getItem } = useAsyncStorage('@bluetooth_default_device')
  const [status, setStatus] = useState<Status>()

  useEffect(() => {
    if (connectedDevice === undefined) return
    startReadingData()
    console.log('device connected.')
    return () => {
      console.log('Closing the connection')
      connectedDevice.cancelConnection()
      setConnectedDevice(undefined)
    }
  }, [connectedDevice])

  useEffect(() => {
    if (deviceId === undefined) {
      getItem()
        .then((value) => {
          if (value !== null) {
            setDeviceId(value)
          }
        })
        .catch((error) => {
          console.error('Failed to read the storage.')
        })
    } else {
      setItem(deviceId)
    }
  }, [deviceId])

  useEffect(() => {
    switch (status) {
      case 'scanning':
        setConnectedDevice(undefined)
        scanForDevices()
        return () => manager.stopDeviceScan()
      case 'connecting':
        connectToDevice()
        break
      case 'disconnecting':
        setConnectedDevice(undefined)
        break
      default:
        break
    }
  }, [status])

  // TODO(gigilibala): Remove this timeout. It is for testing UI, only.
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setHeartRate(Math.floor(Math.random() * 100 + 50))
  //   }, 1000)

  //   return () => {
  //     clearInterval(interval)
  //   }
  // }, [])

  function requestPermission() {
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

  function scanForDevices() {
    console.log('Scanning for devices!')
    requestPermission().then(() => {
      manager.startDeviceScan(null, null, (error, scannedDevice): void => {
        if (error) {
          console.error(error)
          return
        }
        if (!scannedDevice || !scannedDevice.name) return

        setAllDevices((prevState: Device[]): Device[] => {
          if (prevState.some((device) => device.id === scannedDevice.id)) {
            return prevState
          }
          return [...prevState, scannedDevice]
        })
      })
    })
  }

  function connectToDevice() {
    if (deviceId === undefined) return
    console.log('connecting to device ', deviceId)
    manager
      .connectToDevice(deviceId)
      .then((device) => {
        return device.discoverAllServicesAndCharacteristics()
      })
      .then((device) => {
        setConnectedDevice(device)
      })
  }

  function startReadingData() {
    const HEART_RATE_GATT_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb'
    const HEART_RATE_GATT_CHARACTERISTIC =
      '00002a37-0000-1000-8000-00805f9b34fb'
    connectedDevice?.monitorCharacteristicForService(
      HEART_RATE_GATT_SERVICE,
      HEART_RATE_GATT_CHARACTERISTIC,
      onHeartRateUpdate,
    )
  }

  function onHeartRateUpdate(
    error: BleError | null,
    characteristic: Characteristic | null,
  ) {
    if (!characteristic?.value) {
      console.log('No value read!')
      return
    }
    const data = Buffer.from(characteristic.value, 'base64').toString('binary')

    const bytes = new Array<number>(data.length)
    for (let i = 0; i < data.length; i++) {
      bytes[i] = data.charCodeAt(i)
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
    allDevices,
    connectedDevice,
    heartRate,
    setStatus,
    setDeviceId,
  }
}

export const BluetoothContext = createContext<IBluetoothApi>(
  {} as IBluetoothApi,
)

export function BluetoothProvider({ children }: { children: ReactNode }) {
  const state = useBluetooth()

  return (
    <BluetoothContext.Provider value={state}>
      {children}
    </BluetoothContext.Provider>
  )
}
