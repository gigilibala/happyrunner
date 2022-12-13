import { useContext, useEffect, useReducer, useState } from 'react'
import { GeoPosition } from 'react-native-geolocation-service'
import { ActivityType } from '../components/ActivityTypes'
import { DatabaseContext } from '../components/providers/DatabaseProvider'
import { useDataSink } from './dataSink'
import { durationHours, useUnits } from './units'

const INTERVAL_MS = 3000
const MS_IN_SECOND = 1000

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
  speed?: number
  latitude?: number
  longitude?: number
}

export type Lap = {
  id: IdType
  activity_id: IdType
  number: number
  start_time: number
  end_time: number
  min_heart_rate?: number
  avg_heart_rate?: number
  max_heart_rate?: number
  total_steps?: number
  cadence?: number
  duration?: number
  distance?: number
  min_speed?: number
  avg_speed?: number
  max_speed?: number
  // Maybe add temperature also.
}

export type Details = Info & Lap

type Cumulative<T> = { lap: T; total: T }

type Action = {
  type: 'start' | 'pause' | 'stop' | 'resume' | 'nextLap' | 'nextInterval'
}
export type State = {
  id: IdType
  status: 'idle' | 'in-progress' | 'paused' | 'stopped'
  distance: Cumulative<number>
  speed: Cumulative<string>
  heartRate?: Cumulative<number>
  duration: Cumulative<string>
}

function defaultState(id: IdType): State {
  return {
    id,
    status: 'idle',
    distance: { lap: 0, total: 0 },
    speed: { lap: 'N/A', total: 'N/A' },
    duration: { lap: '00:00:00', total: '00:00:00' },
  }
}

type ActivityProps = {
  heartRate?: number
  position?: GeoPosition
  speed?: number
  type: ActivityType
}

export function useActivity({
  heartRate,
  position,
  speed,
  type,
}: ActivityProps): [State, React.Dispatch<Action>] {
  const [started, setStarted] = useState<boolean>(false)

  const [id] = useState<IdType>(new Date().getTime())
  const [_, dbDispatch] = useContext(DatabaseContext)
  const [lap, setLap] = useState<number>(0)

  const [intervalTs, setIntervalTs] = useState<Date>(new Date())
  const [pausedTs, setPausedTs] = useState<Date>()
  const [lapStartTs, setLapStartTs] = useState<Date>(new Date())

  const { units, calculateDisplaySpeed, calculateDistance } = useUnits()
  const [lapSpeedState, lapSpeedDispatch] = useDataSink(speed)
  const [totalSpeedState, totalSpeedDispatch] = useDataSink(speed)

  const [lapHrState, lapHrDispatch] = useDataSink(heartRate)
  const [totalHrState, totalHrDispatch] = useDataSink(heartRate)

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
            distance: {
              lap: calculateDistance(lapSpeedState.sumTs / MS_IN_SECOND),
              total: calculateDistance(totalSpeedState.sumTs / MS_IN_SECOND),
            },
            speed: {
              lap: calculateDisplaySpeed(lapSpeedState.avgTs),
              total: calculateDisplaySpeed(totalSpeedState.avgTs),
            },
            heartRate: {
              lap: Math.round(lapHrState.avgTs),
              total: Math.round(totalHrState.avgTs),
            },
            duration: {
              lap: durationHours(lapSpeedState.duration),
              total: durationHours(totalSpeedState.duration),
            },
          }
      }
    },
    id,
    defaultState,
  )

  useEffect(() => {
    if (!started) return

    dbDispatch({
      type: 'addActivity',
      payload: { data: { id, type } },
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
        lapSpeedDispatch({ type: 'resume' })
        totalSpeedDispatch({ type: 'resume' })
        lapHrDispatch({ type: 'resume' })
        totalSpeedDispatch({ type: 'resume' })
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
              distance: totalSpeedState.sumTs / MS_IN_SECOND,
              duration: totalSpeedState.duration,
              min_speed: totalSpeedState.min,
              avg_speed: totalSpeedState.avgTs,
              max_speed: totalSpeedState.max,
              ...(totalHrState.updated && {
                min_heart_rate: Math.round(totalHrState.min),
              }),
              ...(totalHrState.updated && {
                avg_heart_rate: Math.round(totalHrState.avgTs),
              }),
              ...(totalHrState.updated && {
                max_heart_rate: Math.round(totalHrState.max),
              }),
            },
          },
        })
        break
    }
  }, [state.status])

  useEffect(() => {
    if (state.status !== 'in-progress') return

    const timestamp = new Date()

    if (speed !== undefined) {
      lapSpeedDispatch({ type: 'update', payload: speed })
      totalSpeedDispatch({ type: 'update', payload: speed })
    }

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
          ...(speed && { speed: speed }),
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

    lapSpeedDispatch({ type: 'reset' })
    lapHrDispatch({ type: 'reset' })

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
          distance: lapSpeedState.sumTs / MS_IN_SECOND,
          duration: lapSpeedState.duration,
          min_speed: lapSpeedState.min,
          avg_speed: lapSpeedState.avgTs,
          max_speed: lapSpeedState.max,
          ...(lapHrState.updated && {
            min_heart_rate: Math.round(lapHrState.min),
          }),
          ...(lapHrState.updated && {
            avg_heart_rate: Math.round(lapHrState.avgTs),
          }),
          ...(lapHrState.updated && {
            max_heart_rate: Math.round(lapHrState.max),
          }),
        },
      },
    })

    setLapStartTs(new Date())
  }, [lap])

  useEffect(() => {
    dispatch({ type: 'nextInterval' })
  }, [units, lapSpeedState, totalSpeedState, lapHrState, totalHrState])

  useEffect(() => {
    if (heartRate === undefined) return

    lapHrDispatch({ type: 'update', payload: heartRate })
    totalHrDispatch({ type: 'update', payload: heartRate })
  }, [heartRate])

  return [state, dispatch]
}

function randomId() {
  return Math.floor(Math.random() * 1000000000)
}
