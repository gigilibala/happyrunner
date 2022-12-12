import { useReducer } from 'react'

type Action = { type: 'reset' | 'resume' } | { type: 'update'; payload: number }
type State = {
  value: number
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

function defaultState(defaultValue?: number): State {
  return {
    value: defaultValue || 0,
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
          const timeDiff = timestamp.getTime() - state.timestamp.getTime()
          const duration = state.duration + timeDiff
          const count = state.count + 1
          const sum = state.sum + action.payload
          const sumTs = state.sumTs + action.payload * timeDiff

          return {
            value: action.payload,
            timestamp,
            duration,
            count,
            sum,
            avg: sum / count,
            sumTs,
            avgTs: duration > 0 ? sumTs / duration : 0,
            max: Math.max(action.payload, state.max),
            min: Math.min(action.payload, state.min),
          }

        case 'reset':
          return defaultState(defaultValue)
        case 'resume':
          return { ...state, timestamp: new Date() }
      }
    },
    defaultValue,
    defaultState,
  )

  return [state, dispatch]
}
