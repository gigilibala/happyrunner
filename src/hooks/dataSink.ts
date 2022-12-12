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
          const avg = sum / count
          const sumTs = state.sumTs + action.payload * timeDiff
          const avgTs = duration > 0 ? sumTs / duration : 0

          return {
            value: action.payload,
            timestamp,
            duration,
            count,
            sum,
            avg,
            sumTs,
            avgTs,
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
