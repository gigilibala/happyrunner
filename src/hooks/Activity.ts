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

export type Details = Info & Lap

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
  const id = useRef<number>(0)
  const [isActive, setIsActive] = useState<boolean>(true)
  const [activityType, setActivityType] = useState<ActivityType>('Running')
  const { addActivity, modifyActivity, addActivityDatum, addActivityLap } =
    useContext(DatabaseContext)
  const [intervalTs, setIntervalTs] = useState<Date>()
  const [lap, setLap] = useState<number>(1)

  const pausedTs = useRef<Date>()
  const lapStartTs = useRef<Date>()

  useEffect(() => {
    id.current = new Date().getTime()
    addActivity({
      id: id.current,
      type: activityType,
    })

    setIsActive(true)
    const intervalHandle = setInterval(
      () => setIntervalTs(new Date()),
      INTERVAL_MS,
    )

    return () => {
      setIsActive(false)
      clearInterval(intervalHandle)

      addActivityLap({
        id: randomId(),
        activity_id: id.current,
        start_time: id.current,
        end_time: pausedTs.current
          ? pausedTs.current.getTime()
          : new Date().getTime(),
        number: 0,
      })
    }
  }, [])

  useEffect(() => {
    if (isActive) {
      modifyActivity({
        id: id.current,
        status: 'in-progress',
      })
      pausedTs.current = undefined
    } else {
      const time = new Date()
      modifyActivity({
        id: id.current,
        status: 'stopped',
      })
      console.log('setting paused time: ', time.getTime())
      pausedTs.current = time
    }
  }, [isActive])

  useEffect(() => {
    if (intervalTs === undefined || !isActive) return

    addActivityDatum({
      // Do not use intervalTs here because if the component re-mounts, the old
      // value is used again and will cause duplicate key be added to the
      // database.
      timestamp: new Date().getTime(),
      activity_id: id.current,
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
        activity_id: id.current,
        start_time: lapStartTs.current!.getTime(),
        end_time: endTime.getTime(),
        number: lap,
      })
    }
  }, [lap])

  function nextLap() {
    setLap((prevLap) => prevLap + 1)
  }

  return { isActive, setIsActive, id: id.current, nextLap }
}

function randomId() {
  return Math.floor(Math.random() * 1000000000)
}
