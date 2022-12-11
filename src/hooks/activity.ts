import { useContext, useEffect, useReducer, useState } from 'react'
import { GeoPosition } from 'react-native-geolocation-service'
import { ActivityType } from '../components/ActivityTypes'
import { DatabaseContext } from '../components/providers/DatabaseProvider'
import { DistanceProps, useDistance } from './distance'

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

type Action = {
  type: 'start' | 'pause' | 'stop' | 'resume' | 'nextLap' | 'nextInterval'
}
export type State = {
  id: IdType
  status: 'idle' | 'in-progress' | 'paused' | 'stopped'
  lapDistance: number
  totalDistance: number
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
}): [State, React.Dispatch<Action>] {
  const [started, setStarted] = useState<boolean>(false)

  const [id] = useState<IdType>(new Date().getTime())
  const [_, dbDispatch] = useContext(DatabaseContext)
  const [lap, setLap] = useState<number>(0)

  const [intervalTs, setIntervalTs] = useState<Date>(new Date())
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
        case 'start':
          if (state.status !== 'idle') return state
          setStarted(true)
          return { ...state, status: 'in-progress' }
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
      id,
      status: 'idle',
      totalDistance: 0,
      lapDistance: 0,
    },
  )

  useEffect(() => {
    if (!started) return

    dbDispatch({
      type: 'addActivity',
      payload: { data: { id, type: params.type } },
    })

    const intervalHandle = setInterval(
      () => setIntervalTs(new Date()),
      INTERVAL_MS,
    )

    return () => {
      dispatch({ type: 'stop' })
      clearInterval(intervalHandle)
    }
  }, [started])

  useEffect(() => {
    switch (state.status) {
      case 'idle':
        break
      case 'in-progress':
        const timestamp = new Date()
        lapDistanceDispatch({ type: 'resumeBreak', payload: { timestamp } })
        totalDistanceDispatch({ type: 'resumeBreak', payload: { timestamp } })
        dbDispatch({
          type: 'modifyActivity',
          payload: { data: { id, status: 'in-progress' } },
        })
        setPausedTs(undefined)
        break
      case 'paused':
        dbDispatch({
          type: 'modifyActivity',
          payload: { data: { id, status: 'stopped' } },
        })
        setPausedTs(new Date())
        break
      case 'stopped':
        dbDispatch({
          type: 'modifyActivity',
          payload: { data: { id, status: 'stopped' } },
        })
        setPausedTs(new Date())
        dbDispatch({
          type: 'addActivityLap',
          payload: {
            data: {
              id: randomId(),
              activity_id: id,
              number: 0,
              start_time: id,
              end_time: pausedTs ? pausedTs.getTime() : new Date().getTime(),
              distance: totalDistanceState.rawDistance,
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
          activity_id: id,
          ...(heartRate && { heart_rate: heartRate }),
          ...(position && {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        },
      },
    })
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
          activity_id: id,
          number: lap,
          start_time: lapStartTs.getTime(),
          end_time: endTime.getTime(),
          distance: lapDistanceState.rawDistance,
        },
      },
    })

    setLapStartTs(new Date())
  }, [lap])

  useEffect(() => {
    dispatch({ type: 'nextInterval' })
  }, [lapDistanceState, totalDistanceState])

  return [state, dispatch]
}

function randomId() {
  return Math.floor(Math.random() * 1000000000)
}
