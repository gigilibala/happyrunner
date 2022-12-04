import Notifee, { AuthorizationStatus } from '@notifee/react-native'
import { useEffect, useReducer } from 'react'

type Action =
  | { type: 'display' | 'cancel' }
  | { type: 'success' }
  | { type: 'failure'; error: Error }
type State = { status: 'on' | 'off'; isLoading: boolean; error?: Error }

export function useNotification(): [State, React.Dispatch<Action>] {
  const [state, dispatch] = useReducer(
    (state: State, action: Action): State => {
      switch (action.type) {
        case 'display':
          if (state.isLoading) return state
          displayNotification()
            .then(() => dispatch({ type: 'success' }))
            .catch((error) => {
              console.log('Failed to start notification: ', error)
              dispatch({ type: 'failure', error: error })
            })
          return { status: 'off', isLoading: true }
        case 'cancel':
          if (state.isLoading) return state
          cancelNotification()
            .then(() => dispatch({ type: 'success' }))
            .catch((error) => {
              console.log('Failed to cancel notification: ', error)
              dispatch({ type: 'failure', error: error })
            })
          return { status: 'on', isLoading: true }
        case 'success':
          return { status: 'on', isLoading: false }
        case 'failure':
          return { status: 'off', isLoading: false, error: action.error }
      }
    },
    { status: 'off', isLoading: false },
  )

  useEffect(() => {
    Notifee.onBackgroundEvent(({ type, detail }) => {
      return new Promise<void>((resolve, reject) => {
        resolve()
      })
    })
    const unregisterForegroundEventCallback = Notifee.onForegroundEvent(
      ({ type, detail }) => {
        return new Promise<void>((resolve, reject) => {
          resolve()
        })
      },
    )

    Notifee.registerForegroundService((notification) => {
      return new Promise<void>((resolve, reject) => {})
    })

    dispatch({ type: 'display' })

    return () => {
      dispatch({ type: 'cancel' })
      unregisterForegroundEventCallback()
      Notifee.stopForegroundService().then(() => {
        console.log('Stopped foreground service.')
      })
    }
  }, [])

  async function displayNotification(): Promise<void> {
    console.log('Displaying notification.')
    const permission = await Notifee.requestPermission()
    if (permission.authorizationStatus === AuthorizationStatus.DENIED)
      throw 'Notification display permission not granted!'
    const channelId = await Notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    })
    await Notifee.displayNotification({
      title: 'title',
      subtitle: 'subtitle',
      body: 'body',
      android: {
        channelId: channelId,
        asForegroundService: true,
        ongoing: true,
        pressAction: {
          id: 'default',
        },
        actions: [{ title: 'Stop', pressAction: { id: 'default' } }],
      },
    })
  }

  async function cancelNotification(): Promise<void> {
    await Notifee.cancelAllNotifications()
    console.log('Cancelled all notifications.')
    await Notifee.stopForegroundService()
  }

  return [state, dispatch]
}
