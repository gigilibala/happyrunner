import { useEffect, useReducer, useState } from 'react'
import {
  Permission,
  PermissionStatus,
  PermissionsAndroid,
  Platform,
} from 'react-native'
import Geolocation from 'react-native-geolocation-service'

type Action =
  | { type: 'start' | 'stop' }
  | { type: 'success' }
  | { type: 'failure'; error: Error }
  | { type: 'position'; payload: Geolocation.GeoPosition }
type State = { status: 'started' | 'idle'; position?: Geolocation.GeoPosition }

export function useLocation(): [State, React.Dispatch<Action>] {
  const [watchId, setWatchId] = useState<number>()
  const [serviceEnabled, setServiceEnabled] = useState<boolean>(true)

  const [state, dispatch] = useReducer(
    (state: State, action: Action): State => {
      switch (action.type) {
        case 'start':
          if (state.status === 'started') return state
          start()
          return {
            status: 'idle',
          }
        case 'stop':
          if (state.status !== 'started') return state
          Geolocation.stopObserving()
          console.log('Stopped geolocation.')
          return { status: 'idle' }
        case 'success':
          return { status: 'started' }
        case 'failure':
          return { status: 'idle' }
        case 'position':
          return { status: 'started', position: action.payload }
      }
    },
    { status: 'idle' },
  )

  useEffect(() => {
    return () => dispatch({ type: 'stop' })
  }, [])

  useEffect(() => {
    if (watchId !== undefined) {
      dispatch({ type: 'success' })
      return () => Geolocation.clearWatch(watchId)
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
            (pos) => dispatch({ type: 'position', payload: pos }),
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
      .catch((error) => {
        dispatch({ type: 'failure', error: error })
        console.log('Failed requesting location authorization: ', error)
      })
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

  return [state, dispatch]
}
