import { useEffect, useState } from 'react'
import {
  Permission,
  PermissionsAndroid,
  PermissionStatus,
  Platform,
} from 'react-native'
import Geolocation from 'react-native-geolocation-service'

interface ILocationApi {
  position?: Geolocation.GeoPosition
}

export function useLocation(): ILocationApi {
  const [position, setPosition] = useState<Geolocation.GeoPosition>()
  const [watchId, setWatchId] = useState<number>()
  const [serviceEnabled, setServiceEnabled] = useState<boolean>(true)

  useEffect(() => {
    start()
  }, [])

  useEffect(() => {
    if (watchId === undefined) return

    return () => {
      Geolocation.clearWatch(watchId)
      Geolocation.stopObserving()
      console.log('Stopped geolocation.')
    }
  }, [watchId])

  function start() {
    if (!serviceEnabled) return
    console.log('Starting geolocation.')
    requestPermission()
      .then(() => {
        console.log('Location service authorized.')
        setWatchId(
          Geolocation.watchPosition(
            (pos) => setPosition(pos),
            (error) => console.log('Failed to watch position', error),
            {
              interval: 2000,
              fastestInterval: 1000,
              enableHighAccuracy: true,
              distanceFilter: 1,
            },
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
        const permissions: Permission[] = [
          'android.permission.ACCESS_FINE_LOCATION',
        ]
        PermissionsAndroid.requestMultiple(permissions).then((result) => {
          const permission = permissions.reduce<PermissionStatus>(
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
        })
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

  return { position }
}
