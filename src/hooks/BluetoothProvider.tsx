import { useAsyncStorage } from '@react-native-async-storage/async-storage'
import { Buffer } from 'buffer'
import React, { createContext, ReactNode, useEffect, useState } from 'react'
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from 'react-native-ble-plx'
import { bluetoothDefaultDeviceKey } from '../common/constants'

const manager = new BleManager()

interface IBluetoothApi {
  allDevices: Device[]
  scanForDevices: () => void
  connectToDevice: (deviceId?: string) => Promise<void>
  connectedDevice: Device | null
  heartRate: number
}

function useBluetooth(): IBluetoothApi {
  const [allDevices, setAllDevices] = useState<Device[]>([])
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null)
  const [heartRate, setHeartRate] = useState<number>(0)
  const { setItem, getItem } = useAsyncStorage(bluetoothDefaultDeviceKey)

  useEffect(() => {
    if (!connectedDevice) return
    startReadingData(connectedDevice)
    console.log('device connected.')
    // return () => {
    //   console.log('Closing the connection')
    //   connectedDevice.cancelConnection()
    // }
  }, [connectedDevice])

  // TODO(gigilibala): Remove this timeout. It is for testing UI, only.
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(Math.floor(Math.random() * 100 + 50))
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  function scanForDevices() {
    console.log('Scanning for devices!')
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
  }

  async function connectToDevice(deviceId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      getItem().then((value) => {
        if (!deviceId && value) deviceId = value

        if (deviceId) {
          manager
            .connectToDevice(deviceId)
            .then((newDevice) => {
              return newDevice.discoverAllServicesAndCharacteristics()
            })
            .then((finalDevice) => {
              setConnectedDevice(finalDevice)
              manager.stopDeviceScan()
              resolve()
              // @ts-ignore
              return setItem(deviceId)
            })
            .catch((reason) => {
              reject(reason)
            })
        } else {
          reject('No valid devices are present.')
          return
        }
      })
    })
  }

  function startReadingData(device: Device) {
    if (!device) {
      console.error('No device is connected to read the data.')
      return
    }

    const HEART_RATE_GATT_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb'
    const HEART_RATE_GATT_CHARACTERISTIC =
      '00002a37-0000-1000-8000-00805f9b34fb'
    device.monitorCharacteristicForService(
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
      console.log('No value read.')
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
    scanForDevices,
    connectToDevice,
    connectedDevice,
    heartRate,
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
