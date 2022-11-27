import { useContext, useEffect, useState } from 'react'
import { GeoPosition } from 'react-native-geolocation-service'
import { DatabaseContext } from '../hooks/DatabaseProvider'
import { HeartRateMonitorContext } from './HeartRateMonitorProvider'
import { useLocation } from './Location'

type ActivityType = 'Running'

type Status = 'in-progress' | 'stopped'

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
  id: number
  status?: Status
  setStatus: (status: Status) => void
  position?: GeoPosition
}

export default function useActivity(): IActivity {
  const [id, setId] = useState<number>(new Date().getTime())
  const [status, setStatus] = useState<Status>()
  const [activityType, setActivityType] = useState<ActivityType>('Running')
  const { addActivity, modifyActivity, addActivityData } =
    useContext(DatabaseContext)
  const { heartRate } = useContext(HeartRateMonitorContext)
  const { setIsActive, position } = useLocation()
  const [dataCollectionInterval, setDataCollectionInterval] = useState<number>()
  const [timestamp, setTimestamp] = useState<number>()

  useEffect(() => {
    addActivity({
      id: id,
      start_time: new Date().getTime(),
      type: activityType,
    })
    setStatus('in-progress')
    setDataCollectionInterval(
      setInterval(() => setTimestamp(new Date().getTime()), INTERVAL_MS),
    )
    setIsActive(true)

    return () => {
      setStatus('stopped')
      setIsActive(false)
    }
  }, [id])

  useEffect(() => {
    if (status === undefined) return
    const time = new Date()
    switch (status) {
      case 'in-progress':
        modifyActivity({
          id: id,
          status: 'in-progress',
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

  useEffect(() => {
    if (timestamp === undefined || status === 'stopped') return

    addActivityData({
      activity_id: id,
      timestamp: timestamp,
      heart_rate: heartRate,
      latitude: position?.coords.latitude,
      longitude: position?.coords.longitude,
      status: status,
    })
  }, [timestamp])

  useEffect(() => {
    if (dataCollectionInterval !== undefined)
      return () => clearInterval(dataCollectionInterval)
  }, [dataCollectionInterval])

  return { status, setStatus, position, id }
}
