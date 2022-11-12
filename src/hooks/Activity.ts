import { useContext, useEffect, useState } from 'react'
import { DatabaseContext } from '../hooks/DatabaseProvider'
import { BluetoothContext } from './BluetoothProvider'

type ActivityType = 'Running'

type Status = 'in-progress' | 'paused' | 'stopped'

const INTERVAL_MS = 1000

// Keep in sync with database table.
export type Activity = {
  id: number
  status?: Status
  type?: ActivityType
  start_time?: number
  end_time?: number
  avg_heart_rate?: number
  max_heart_rate?: number
  avg_pace?: number
  total_steps?: number
  cadence?: number
  total_active_time_seconds?: number
  total_distance?: number
}

export type ActivityData = {
  timestamp: number
  activity_id: number
  heart_rate?: number
  latitude?: number
  longitude?: number
  status?: Status
}

export interface IActivity {
  status?: Status
  start(): void
  pause(): void
  resume(): void
  stop(): void
  addData(): void
}

export default function useActivity(): IActivity {
  const [id, setId] = useState<number>()
  const [status, setStatus] = useState<Status>()
  const [activityType, setActivityType] = useState<ActivityType>('Running')
  const { addActivity, modifyActivity, addActivityData } =
    useContext(DatabaseContext)
  const { heartRate } = useContext(BluetoothContext)
  let interval: number

  useEffect(() => {
    if (id === undefined) return
    addActivity({
      id: id,
      start_time: new Date().getTime(),
      type: activityType,
    })
  }, [id])

  useEffect(() => {
    if (status === undefined) return
    if (id === undefined) {
      console.info('Activity ID has not been set')
      return
    }
    const time = new Date()
    switch (status) {
      case 'in-progress':
        modifyActivity({
          id: id,
          status: 'in-progress',
        })
        interval = setInterval(addData, INTERVAL_MS)
        break
      case 'paused':
        modifyActivity({
          id: id,
          status: 'paused',
        })
        break
      case 'stopped':
        modifyActivity({
          id: id,
          status: 'stopped',
          end_time: time.getTime(),
        })
        break
      default:
        break
    }
  }, [status])

  function start(): void {
    // TODO(gigilibala): Maybe change ID to something else other than current time.
    const time = new Date()
    setId(time.getTime())
    setStatus('in-progress')
  }

  function pause(): void {
    clearInterval(interval)
    setStatus('paused')
  }
  function stop(): void {
    clearInterval(interval)
    setStatus('stopped')
  }
  function resume(): void {
    setInterval(addData, INTERVAL_MS)
    setStatus('in-progress')
  }

  // TODO(gigilibala): For testing, remove.
  function addData(): void {
    if (id === undefined) {
      console.error('Activity ID has not been set.')
      return
    }
    addActivityData({
      activity_id: id,
      timestamp: new Date().getTime(),
      heart_rate: heartRate,
      latitude: 1.1,
      longitude: 2.2,
      status: status,
    })
  }

  return { start, pause, stop, resume, status, addData }
}
