import Notifee, {
  AndroidVisibility,
  AuthorizationStatus,
  EventType,
  Notification,
} from '@notifee/react-native'
import { useEffect, useReducer, useState } from 'react'

type FgnProps = {
  title?: string
  subtitle?: string
  body?: string
}
type Action = { type: 'updateFg'; payload: FgnProps }
type State = {
  fgn: FgnProps
}

export function useNotification(): [State, React.Dispatch<Action>] {
  const [fgn, setFgn] = useState<Notification>()

  const [state, dispatch] = useReducer(
    (state: State, action: Action): State => {
      switch (action.type) {
        case 'updateFg':
          return { ...state, fgn: action.payload }
      }
    },
    { fgn: {} },
  )

  useEffect(() => {
    Notifee.onBackgroundEvent(({ type, detail }) => {
      return new Promise<void>((resolve, reject) => {
        console.log(
          `Background event type ${type} with detail ${JSON.stringify(
            detail,
          )} received.`,
        )
        resolve()
      })
    })
    const unregisterForegroundEventCallback = Notifee.onForegroundEvent(
      ({ type, detail }) => {
        return new Promise<void>((resolve, reject) => {
          if (type === EventType.DELIVERED) return
          console.log(
            `Foreground event type ${type} with detail ${JSON.stringify(
              detail,
            )} received`,
          )
          resolve()
        })
      },
    )

    Notifee.registerForegroundService((notification) => {
      setFgn(notification)
      return new Promise<void>(() => {})
    })

    displayNotification().catch((error) => {
      console.error('Failed to start notification: ', error)
    })

    return () => {
      cancelNotification().catch((error) => {
        console.warn('Failed to cancel notification: ', error)
      })
      unregisterForegroundEventCallback()
      Notifee.stopForegroundService().then(() => {
        console.log('Stopped foreground service.')
      })
    }
  }, [])

  useEffect(() => {
    if (fgn === undefined) return

    Notifee.displayNotification({
      id: fgn.id,
      title: state.fgn.title,
      subtitle: state.fgn.subtitle,
      body: state.fgn.body,
      android: { ...fgn.android },
    }).catch((error) => console.error('Failed to set notification: ', error))
  }, [state.fgn, fgn])

  async function displayNotification(): Promise<void> {
    console.log('Displaying notification.')
    const permission = await Notifee.requestPermission()
    // TODO: Handle denied authorization.
    if (permission.authorizationStatus === AuthorizationStatus.DENIED)
      throw 'Notification display permission not granted!'
    const channelId = await Notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    })

    await Notifee.displayNotification({
      android: {
        channelId: channelId,
        asForegroundService: true,
        ongoing: true,
        onlyAlertOnce: true,
        showChronometer: true,
        timestamp: Date.now(),
        // TODO: set large icon.
        pressAction: {
          id: 'default',
        },
        visibility: AndroidVisibility.PUBLIC,
        actions: [
          { title: 'Stop', pressAction: { id: 'default' } },
          { title: 'Lap', pressAction: { id: 'default' } },
        ],
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
