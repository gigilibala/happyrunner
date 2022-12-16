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

type PeriodType = 'lap' | 'total'

type Cumulative<T> = { lap: T; total: T }

type Action = {
  type: 'start' | 'pause' | 'stop' | 'resume' | 'nextLap' | 'nextInterval'
}
export type State = {
  id: IdType
  status: 'idle' | 'in-progress' | 'paused' | 'stopped'
  distance: Cumulative<string>
  speed: Cumulative<string>
  heartRate?: Cumulative<string>
  duration: Cumulative<string>
}

function defaultState(id: IdType): State {
  return {
    id,
    status: 'idle',
    distance: { lap: 'N/A', total: 'N/A' },
    speed: { lap: 'N/A', total: 'N/A' },
    duration: { lap: 'N/A', total: 'N/A' },
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
  const [speedState, speedDispatch] = useDataSink(speed)
  const [hrState, hrDispatch] = useDataSink(heartRate)

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
              lap: calculateDistance(speedState.lap.sumTs / MS_IN_SECOND),
              total: calculateDistance(speedState.total.sumTs / MS_IN_SECOND),
            },
            speed: {
              lap: calculateDisplaySpeed(speedState.lap.avgTs),
              total: calculateDisplaySpeed(speedState.total.avgTs),
            },
            heartRate: {
              lap: Math.round(hrState.lap.avgTs).toString(),
              total: Math.round(hrState.total.avgTs).toString(),
            },
            duration: {
              lap: durationHours(speedState.lap.duration),
              total: durationHours(speedState.total.duration),
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
        speedDispatch({ type: 'resume' })
        hrDispatch({ type: 'resume' })
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
        addActivityPeriodInfo('total')
        break
    }
  }, [state.status])

  useEffect(() => {
    if (state.status !== 'in-progress') return

    const timestamp = new Date()

    if (speed !== undefined) {
      speedDispatch({ type: 'update', payload: speed })
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

    speedDispatch({ type: 'reset' })
    hrDispatch({ type: 'reset' })

    const endTime = pausedTs ? pausedTs : new Date()
    // Protection against adding new laps when paused or stopped.
    if (endTime < lapStartTs) return
    addActivityPeriodInfo('lap')

    setLapStartTs(new Date())
  }, [lap])

  useEffect(() => {
    dispatch({ type: 'nextInterval' })
  }, [units, speedState, hrState])

  useEffect(() => {
    if (heartRate === undefined) return

    hrDispatch({ type: 'update', payload: heartRate })
  }, [heartRate])

  function addActivityPeriodInfo(periodType: PeriodType): void {
    dbDispatch({
      type: 'addActivityLap',
      payload: {
        data: {
          id: randomId(),
          activity_id: id,
          number: periodType === 'lap' ? lap : 0,
          start_time: periodType === 'lap' ? lapStartTs.getTime() : id,
          end_time: pausedTs ? pausedTs.getTime() : new Date().getTime(),
          distance: speedState[periodType].sumTs / MS_IN_SECOND,
          duration: speedState[periodType].duration,
          min_speed: speedState[periodType].min,
          avg_speed: speedState[periodType].avgTs,
          max_speed: speedState[periodType].max,
          ...(hrState.updated && {
            min_heart_rate: Math.round(hrState[periodType].min),
            avg_heart_rate: Math.round(hrState[periodType].avgTs),
            max_heart_rate: Math.round(hrState[periodType].max),
          }),
        },
      },
    })
  }

  return [state, dispatch]
}

function randomId() {
  return Math.floor(Math.random() * 1000000000)
}
