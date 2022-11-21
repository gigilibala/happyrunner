import { useContext, useEffect, useState } from 'react'
import BT from 'react-native-background-timer'
import { DatabaseContext } from '../hooks/DatabaseProvider'
import { HeartRateMonitorContext } from './HeartRateMonitorProvider'
import { useLocation } from './Location'

type ActivityType = 'Running'

type Status = 'in-progress' | 'paused' | 'stopped'

const INTERVAL_MS = 3000

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
  setStatus: (status: Status) => void
  start: () => void
}

export default function useActivity(): IActivity {
  const [id, setId] = useState<number>()
  const [status, setStatus] = useState<Status>()
  const [activityType, setActivityType] = useState<ActivityType>('Running')
  const { addActivity, modifyActivity, addActivityData } =
    useContext(DatabaseContext)
  const { heartRate } = useContext(HeartRateMonitorContext)
  const { setIsActive, position } = useLocation()
  const [timestamp, setTimestamp] = useState<number>()

  useEffect(() => {
    if (id === undefined) return
    addActivity({
      id: id,
      start_time: new Date().getTime(),
      type: activityType,
    })
    setStatus('in-progress')
  }, [id])

  useEffect(() => {
    if (status === undefined || id === undefined) return
    const time = new Date()
    switch (status) {
      case 'in-progress':
        modifyActivity({
          id: id,
          status: 'in-progress',
        })
        startCollectingData()
        break
      case 'paused':
        modifyActivity({
          id: id,
          status: 'paused',
        })
        stopCollectingData()
        break
      case 'stopped':
        modifyActivity({
          id: id,
          status: 'stopped',
          end_time: time.getTime(),
        })
        setId(undefined)
        stopCollectingData()
        break
      default:
        break
    }
  }, [status])

  useEffect(() => {
    if (timestamp === undefined || id == undefined) return

    addActivityData({
      activity_id: id,
      timestamp: timestamp,
      heart_rate: heartRate,
      latitude: position?.coords.latitude,
      longitude: position?.coords.longitude,
      status: status,
    })
  }, [timestamp])

  function start(): void {
    // TODO(gigilibala): Maybe change ID to something else other than current time.
    setId(new Date().getTime())
  }

  function startCollectingData(): void {
    console.log('Starting to collect data.')
    setIsActive(true)
    BT.runBackgroundTimer(() => setTimestamp(new Date().getTime()), INTERVAL_MS)
  }

  function stopCollectingData(): void {
    console.log('Stopping data collection.')
    BT.stopBackgroundTimer()
    setIsActive(false)
  }

  return { status, setStatus, start }
}
