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
import { DatabaseContext } from '../components/providers/DatabaseProvider'
import { DistanceProps, useDistance } from './distance'

type Action = { type: 'pause' | 'stop' | 'resume' | 'nextLap' | 'nextInterval' }
export type State = {
  status: 'in-progress' | 'paused' | 'stopped'
  lapDistance: number
  totalDistance: number
}

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

export function useActivity({
  heartRate,
  position,
  speed,
  params,
}: {
  heartRate?: number
  position?: GeoPosition
  speed?: number
  params: ActivityParams
}): IActivity {
  const id = useRef<IdType>(0)
  const [_, dbDispatch] = useContext(DatabaseContext)
  const [intervalTs, setIntervalTs] = useState<Date>(new Date())
  const [lap, setLap] = useState<number>(0)

  const [pausedTs, setPausedTs] = useState<Date>()
  const [lapStartTs, setLapStartTs] = useState<Date>(new Date())

  const distanceProps: DistanceProps = {
    position: position,
    speed: speed,
  }
  const [lapDistanceState, lapDistanceDispatch] = useDistance(distanceProps)
  const [totalDistanceState, totalDistanceDispatch] = useDistance(distanceProps)

  const [state, dispatch] = useReducer(
    (state: State, action: Action): State => {
      switch (action.type) {
        case 'resume':
          if (state.status === 'in-progress') return state
          return { ...state, status: 'in-progress' }
        case 'pause':
          if (state.status === 'paused') return state
          return { ...state, status: 'paused' }
        case 'stop':
          if (state.status === 'stopped') return state
          setLap((prevLap) => prevLap + 1)
          return { ...state, status: 'stopped' }
        case 'nextLap':
          setLap((prevLap) => prevLap + 1)
          return state
        case 'nextInterval':
          return {
            ...state,
            lapDistance: lapDistanceState.displayDistance,
            totalDistance: totalDistanceState.displayDistance,
          }
      }
    },
    {
      status: 'in-progress',
      totalDistance: totalDistanceState.displayDistance,
      lapDistance: lapDistanceState.displayDistance,
    },
  )

  useEffect(() => {
    id.current = new Date().getTime()
    dbDispatch({
      type: 'addActivity',
      payload: { data: { id: id.current, type: params.type } },
    })

    const intervalHandle = setInterval(
      () => setIntervalTs(new Date()),
      INTERVAL_MS,
    )

    return () => {
      dispatch({ type: 'stop' })
      clearInterval(intervalHandle)
    }
  }, [])

  useEffect(() => {
    switch (state.status) {
      case 'in-progress':
        dbDispatch({
          type: 'modifyActivity',
          payload: { data: { id: id.current, status: 'in-progress' } },
        })
        setPausedTs(undefined)
        break
      case 'paused':
        dbDispatch({
          type: 'modifyActivity',
          payload: { data: { id: id.current, status: 'stopped' } },
        })
        setPausedTs(new Date())
        break
      case 'stopped':
        dbDispatch({
          type: 'modifyActivity',
          payload: { data: { id: id.current, status: 'stopped' } },
        })
        setPausedTs(new Date())
        dbDispatch({
          type: 'addActivityLap',
          payload: {
            data: {
              id: randomId(),
              activity_id: id.current,
              number: 0,
              start_time: id.current,
              end_time: pausedTs ? pausedTs.getTime() : new Date().getTime(),
            },
          },
        })
        break
    }
  }, [state.status])

  useEffect(() => {
    if (state.status !== 'in-progress') return

    const timestamp = new Date()

    lapDistanceDispatch({
      type: 'update',
      payload: { timestamp },
    })
    totalDistanceDispatch({
      type: 'update',
      payload: { timestamp },
    })

    dbDispatch({
      type: 'addActivityDatum',
      payload: {
        data: {
          // Do not use intervalTs here because if the component re-mounts, the old
          // value is used again and will cause duplicate key be added to the
          // database.
          timestamp: timestamp.getTime(),
          activity_id: id.current,
          ...(heartRate && { heart_rate: heartRate }),
          ...(position && {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        },
      },
    })

    dispatch({ type: 'nextInterval' })
  }, [intervalTs])

  useEffect(() => {
    // We only want to add a lap at the end of the lap.
    if (lap === 0) return

    lapDistanceDispatch({ type: 'reset' })

    const endTime = pausedTs ? pausedTs : new Date()
    // Protection against adding new laps when paused or stopped.
    if (endTime < lapStartTs) return
    dbDispatch({
      type: 'addActivityLap',
      payload: {
        data: {
          id: randomId(),
          activity_id: id.current,
          number: lap,
          start_time: lapStartTs.getTime(),
          end_time: endTime.getTime(),
        },
      },
    })

    setLapStartTs(new Date())
  }, [lap])

  return { state, dispatch, id: id.current }
}

function randomId() {
  return Math.floor(Math.random() * 1000000000)
}
