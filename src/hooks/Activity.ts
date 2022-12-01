import {
  Dispatch,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react'
import { GeoPosition } from 'react-native-geolocation-service'
import { ActivityType } from '../components/ActivityTypes'
import { DatabaseContext } from '../hooks/DatabaseProvider'

type Status = 'in-progress' | 'paused' | 'stopped'
type Action = { type: 'pause' | 'stop' | 'resume' | 'nextLap' }
type State = { status: Status }

const INTERVAL_MS = 3000

export type IdType = number

// Keep in sync with database table.
export type Info = {
  id: IdType
  status?: 'in-progress' | 'stopped'
  type?: ActivityType
  notes?: string
}

export type Datum = {
  timestamp: number
  activity_id: IdType
  heart_rate?: number
  latitude?: number
  longitude?: number
}

export type Lap = {
  id: IdType
  activity_id: IdType
  number: number
  start_time: number
  end_time: number
  avg_heart_rate?: number
  max_heart_rate?: number
  total_steps?: number
  cadence?: number
  active_duration?: number
  distance?: number
  // Maybe add temperature also.
}

export type Details = Info & Lap

export type ActivityParams = {
  type: ActivityType
}

export interface IActivity {
  id: IdType
  state: State
  dispatch: Dispatch<Action>
}

export default function useActivity({
  heartRate,
  position,
  params,
}: {
  heartRate?: number
  position?: GeoPosition
  params: ActivityParams
}): IActivity {
  const id = useRef<IdType>(0)
  const { addActivity, modifyActivity, addActivityDatum, addActivityLap } =
    useContext(DatabaseContext)
  const [intervalTs, setIntervalTs] = useState<Date>()
  const [lap, setLap] = useState<number>(1)

  const pausedTs = useRef<Date>()
  const lapStartTs = useRef<Date>()

  const [state, dispatch] = useReducer(
    (state: State, action: Action): State => {
      switch (action.type) {
        case 'resume':
          return { status: 'in-progress' }
        case 'pause':
          return { status: 'paused' }
        case 'stop':
          return { status: 'stopped' }
        case 'nextLap':
          setLap((prevLap) => prevLap + 1)
          return state
      }
    },
    {
      status: 'in-progress',
    },
  )

  useEffect(() => {
    id.current = new Date().getTime()
    addActivity({
      id: id.current,
      type: params.type,
    })

    const intervalHandle = setInterval(
      () => setIntervalTs(new Date()),
      INTERVAL_MS,
    )

    return () => {
      dispatch({ type: 'stop' })
      clearInterval(intervalHandle)

      addActivityLap({
        id: randomId(),
        activity_id: id.current,
        number: 0,
        start_time: id.current,
        end_time: pausedTs.current
          ? pausedTs.current.getTime()
          : new Date().getTime(),
      })
    }
  }, [])

  useEffect(() => {
    if (state.status === 'in-progress') {
      modifyActivity({
        id: id.current,
        status: 'in-progress',
      })
      pausedTs.current = undefined
    } else {
      modifyActivity({
        id: id.current,
        status: 'stopped',
      })
      pausedTs.current = new Date()
    }
  }, [state])

  useEffect(() => {
    if (intervalTs === undefined || state.status !== 'in-progress') return

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
        number: lap,
        start_time: lapStartTs.current!.getTime(),
        end_time: endTime.getTime(),
      })
    }
  }, [lap])

  return { state, dispatch, id: id.current }
}

function randomId() {
  return Math.floor(Math.random() * 1000000000)
}
