import { useContext, useEffect, useState } from 'react'
import { GeoPosition } from 'react-native-geolocation-service'
import { DatabaseContext } from '../hooks/DatabaseProvider'
import { HeartRateMonitorContext } from './HeartRateMonitorProvider'
import { useLocation } from './Location'

type ActivityType = 'Running'

type Status = 'in-progress' | 'stopped'

const INTERVAL_MS = 3000

// Keep in sync with database table.
export type Info = {
  id: number
  status?: Status
  type?: ActivityType
  start_time?: number
  end_time?: number
}

export type Datum = {
  timestamp: number
  activity_id: number
  heart_rate?: number
  latitude?: number
  longitude?: number
}

export type Lap = {
  timestamp: number
  activity_id: number
  number: number
  avg_heart_rate?: number
  max_heart_rate?: number
  avg_pace?: number
  total_steps?: number
  cadence?: number
  total_active_time_seconds?: number
  total_distance?: number
}

export interface IActivity {
  id: number
  isActive: boolean
  setIsActive: (isActive: boolean) => void
  position?: GeoPosition
  nextLap: () => void
}

export default function useActivity(): IActivity {
  const [id, setId] = useState<number>(new Date().getTime())
  const [isActive, setIsActive] = useState<boolean>(false)
  const [activityType, setActivityType] = useState<ActivityType>('Running')
  const { addActivity, modifyActivity, addActivityDatum, addActivityLap } =
    useContext(DatabaseContext)
  const { heartRate } = useContext(HeartRateMonitorContext)
  const { position } = useLocation()
  const [dataCollectionInterval, setDataCollectionInterval] = useState<number>()
  const [timestamp, setTimestamp] = useState<number>()
  const [lap, setLap] = useState<number>(0)

  useEffect(() => {
    addActivity({
      id: id,
      start_time: new Date().getTime(),
      type: activityType,
    })
    setIsActive(true)
    setDataCollectionInterval(
      setInterval(() => setTimestamp(new Date().getTime()), INTERVAL_MS),
    )

    return () => {
      setIsActive(false)
    }
  }, [id])

  useEffect(() => {
    if (isActive) {
      modifyActivity({
        id: id,
        status: 'in-progress',
      })
    } else {
      modifyActivity({
        id: id,
        status: 'stopped',
        end_time: new Date().getTime(),
      })
    }
  }, [isActive])

  useEffect(() => {
    if (timestamp === undefined || !isActive) return

    addActivityDatum({
      activity_id: id,
      timestamp: timestamp,
      heart_rate: heartRate,
      latitude: position?.coords.latitude,
      longitude: position?.coords.longitude,
    })
  }, [timestamp])

  useEffect(() => {
    if (lap === 0) return
    addActivityLap({
      activity_id: id,
      timestamp: new Date().getTime(),
      number: lap,
    })
  }, [lap])

  useEffect(() => {
    if (dataCollectionInterval !== undefined)
      return () => clearInterval(dataCollectionInterval)
  }, [dataCollectionInterval])

  function nextLap() {
    setLap((prevLap) => prevLap + 1)
  }

  return { isActive, setIsActive, position, id, nextLap }
}
