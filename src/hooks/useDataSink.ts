import { useReducer } from 'react'

type Action = { type: 'reset' | 'resume' } | { type: 'update'; payload: number }
type State = {
  updated: boolean
  value: number
  lap: IntervalState
  total: IntervalState
}

function defaultState(defaultValue?: number): State {
  const initial: IntervalState = defaultInterval(defaultValue)
  return {
    updated: false,
    value: defaultValue || 0,
    lap: initial,
    total: initial,
  }
}

type IntervalState = {
  count: number
  sum: number
  avg: number

  timestamp: Date
  sumTs: number
  avgTs: number

  duration: number

  max: number
  min: number
}

function defaultInterval(defaultValue?: number): IntervalState {
  return {
    timestamp: new Date(),
    count: defaultValue ? 1 : 0,

    sum: defaultValue || 0,
    avg: defaultValue || 0,

    sumTs: defaultValue || 0,
    avgTs: defaultValue || 0,

    duration: 0,

    max: defaultValue || -1000000,
    min: defaultValue || 1000000,
  }
}

export function useDataSink(
  defaultValue?: number,
): [State, React.Dispatch<Action>] {
  const [state, dispatch] = useReducer(
    (state: State, action: Action): State => {
      switch (action.type) {
        case 'update':
          const timestamp = new Date()
          return {
            value: action.payload,
            updated: true,
            lap: updateInterval(timestamp, action.payload, state.lap),
            total: updateInterval(timestamp, action.payload, state.total),
          }

        case 'reset':
          return { ...state, lap: defaultInterval(defaultValue) }
        case 'resume':
          return { ...state, lap: { ...state.lap, timestamp: new Date() } }
      }
    },
    defaultValue,
    defaultState,
  )

  function updateInterval(
    timestamp: Date,
    value: number,
    state: IntervalState,
  ): IntervalState {
    const timeDiff = timestamp.getTime() - state.timestamp.getTime()
    const duration = state.duration + timeDiff
    const count = state.count + 1
    const sum = state.sum + value
    const sumTs = state.sumTs + value * timeDiff

    return {
      timestamp,
      duration,
      count,
      sum,
      avg: sum / count,
      sumTs,
      avgTs: duration > 0 ? sumTs / duration : 0,
      max: Math.max(value, state.max),
      min: Math.min(value, state.min),
    }
  }

  return [state, dispatch]
}
