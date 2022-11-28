import Notifee from '@notifee/react-native'
import { useEffect } from 'react'

export interface INotificationApi {
  displayNotification: () => Promise<void>
  cancelNotification: () => Promise<void>
}

export default function useNotification(): INotificationApi {
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

    return () => {
      unregisterForegroundEventCallback()
      Notifee.stopForegroundService().then(() => {
        console.log('Stopped foreground service.')
      })
    }
  }, [])

  async function displayNotification(): Promise<void> {
    console.log('Displaying notification.')
    const permission = await Notifee.requestPermission()
    const channelId = await Notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    })
    const value = await Notifee.displayNotification({
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
    return await Notifee.stopForegroundService()
  }

  return { displayNotification, cancelNotification }
}
