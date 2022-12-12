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

function defaultState(): State {
  return {
    value: 0,
    timestamp: new Date(),
    count: 0,

    sum: 0,
    avg: 0,

    sumTs: 0,
    avgTs: 0,

    duration: 0,

    max: -Infinity,
    min: Infinity,
  }
}

export function useDataSink(): [State, React.Dispatch<Action>] {
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
          return defaultState()
        case 'resume':
          return { ...state, timestamp: new Date() }
      }
    },
    undefined,
    defaultState,
  )

  return [state, dispatch]
}
