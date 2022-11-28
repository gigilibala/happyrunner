import { useContext, useEffect, useRef, useState } from 'react'
import { GeoPosition } from 'react-native-geolocation-service'
import { DatabaseContext } from '../hooks/DatabaseProvider'

type ActivityType = 'Running'

type Status = 'in-progress' | 'stopped'

const INTERVAL_MS = 3000

// Keep in sync with database table.
export type Info = {
  id: number
  status?: Status
  type?: ActivityType
  notes?: string
}

export type Datum = {
  timestamp: number
  activity_id: number
  heart_rate?: number
  latitude?: number
  longitude?: number
}

export type Lap = {
  id: number
  activity_id: number
  start_time?: number
  end_time?: number
  number: number
  avg_heart_rate?: number
  max_heart_rate?: number
  total_steps?: number
  cadence?: number
  active_duration?: number
  distance?: number
  // Maybe add temperature also.
}

export interface IActivity {
  id: number
  isActive: boolean
  setIsActive: (isActive: boolean) => void
  nextLap: () => void
}

export default function useActivity({
  heartRate,
  position,
}: {
  heartRate?: number
  position?: GeoPosition
}): IActivity {
  const [id, setId] = useState<number>(new Date().getTime())
  const [isActive, setIsActive] = useState<boolean>(true)
  const [activityType, setActivityType] = useState<ActivityType>('Running')
  const { addActivity, modifyActivity, addActivityDatum, addActivityLap } =
    useContext(DatabaseContext)
  const [dataCollectionInterval, setDataCollectionInterval] = useState<number>()
  const [intervalTs, setIntervalTs] = useState<Date>()
  const [lap, setLap] = useState<number>(1)

  const pausedTs = useRef<Date>()
  const lapStartTs = useRef<Date>()

  useEffect(() => {
    addActivity({
      id: id,
      type: activityType,
    })

    setIsActive(true)

    return () => {
      setIsActive(false)

      addActivityLap({
        id: randomId(),
        activity_id: id,
        start_time: id,
        end_time: pausedTs.current
          ? pausedTs.current.getTime()
          : new Date().getTime(),
        number: 0,
      })
    }
  }, [id])

  useEffect(() => {
    if (isActive) {
      modifyActivity({
        id: id,
        status: 'in-progress',
      })
      pausedTs.current = undefined
    } else {
      const time = new Date()
      modifyActivity({
        id: id,
        status: 'stopped',
      })
      console.log('setting paused time: ', time.getTime())
      pausedTs.current = time
    }
  }, [isActive])

  useEffect(() => {
    if (intervalTs === undefined || !isActive) return

    addActivityDatum({
      timestamp: intervalTs.getTime(),
      activity_id: id,
      heart_rate: heartRate,
      latitude: position?.coords.latitude,
      longitude: position?.coords.longitude,
    })
  }, [intervalTs])

  useEffect(() => {
    lapStartTs.current = new Date()

    return () => {
      const endTime = pausedTs.current ? pausedTs.current : new Date()
      if (endTime < lapStartTs.current!) return
      addActivityLap({
        id: randomId(),
        activity_id: id,
        start_time: lapStartTs.current!.getTime(),
        end_time: endTime.getTime(),
        number: lap,
      })
    }
  }, [lap])

  useEffect(() => {
    if (dataCollectionInterval === undefined) {
      setDataCollectionInterval(
        setInterval(() => setIntervalTs(new Date()), INTERVAL_MS),
      )
    } else {
      return () => clearInterval(dataCollectionInterval)
    }
  }, [dataCollectionInterval])

  function nextLap() {
    setLap((prevLap) => prevLap + 1)
  }

  return { isActive, setIsActive, id, nextLap }
}

function randomId() {
  return Math.floor(Math.random() * 1000000000)
}
