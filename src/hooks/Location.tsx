import { useEffect, useState } from 'react'
import {
  Permission,
  PermissionsAndroid,
  PermissionStatus,
  Platform,
} from 'react-native'
import Geolocation from 'react-native-geolocation-service'

interface ILocationApi {
  setStatus: (status: LocationServiceStatus) => void
  position?: Geolocation.GeoPosition
}

type LocationServiceStatus = 'running' | 'stopped'

export function useLocation(): ILocationApi {
  const [position, setPosition] = useState<Geolocation.GeoPosition>()
  const [status, setStatus] = useState<LocationServiceStatus>('stopped')
  const [watchId, setWatchId] = useState<number>()
  const [serviceEnabled, setServiceEnabled] = useState<boolean>(true)

  useEffect(() => {
    if (watchId === undefined) return

    return () => {
      Geolocation.clearWatch(watchId)
      Geolocation.stopObserving()
      console.log('Stopped geolocation.')
    }
  }, [watchId])

  useEffect(() => {
    switch (status) {
      case 'running':
        start()
        return () => {
          setWatchId(undefined)
        }
        break
      case 'stopped':
        setWatchId(undefined)
        break
      default:
        break
    }
  }, [status])

  function start() {
    if (!serviceEnabled) return
    console.log('Starting geolocation.', Geolocation.watchPosition)
    requestPermission()
      .then(() => {
        console.log('Location service authorized.')
        setWatchId(
          Geolocation.watchPosition(
            (pos) => setPosition(pos),
            (error) => console.log('Failed to watch position', error),
            { interval: 1000, fastestInterval: 500, enableHighAccuracy: true },
          ),
        )
      })
      .catch((error) =>
        console.log('Failed requesting location authorization: ', error),
      )
  }

  function requestPermission() {
    return new Promise<void>((resolve, reject) => {
      if (Platform.OS === 'android') {
        const bluetoothPermissions: Permission[] = [
          'android.permission.ACCESS_FINE_LOCATION',
          'android.permission.ACCESS_BACKGROUND_LOCATION',
        ]
        PermissionsAndroid.requestMultiple(bluetoothPermissions).then(
          (result) => {
            const permission = bluetoothPermissions.reduce<PermissionStatus>(
              (prev, cur) => prev && result[cur],
              'granted',
            )
            switch (permission) {
              case 'granted':
                setServiceEnabled(true)
                resolve()
                break
              case 'denied':
              case 'never_ask_again':
                setServiceEnabled(false)
                reject('Location authorization rejected.')
                break
              default:
                break
            }
          },
        )
      } else {
        Geolocation.requestAuthorization('always').then((permission) => {
          switch (permission) {
            case 'granted':
              setServiceEnabled(true)
              resolve()
              break
            case 'denied':
            case 'disabled':
            case 'restricted':
              setServiceEnabled(false)
              reject('Location authorization rejected.')
            default:
              break
          }
        })
      }
    })
  }

  return { setStatus, position }
}
