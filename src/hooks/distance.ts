import { useReducer, useState } from 'react'
import Geolocation from 'react-native-geolocation-service'
import { useUnits } from './units'

export type DistanceProps = {
  speed?: number
  position?: Geolocation.GeoPosition
}

type Action =
  | { type: 'reset' }
  | { type: 'update' | 'resumeBreak'; payload: { timestamp: Date } }
export type State = {
  rawDistance: number
  displayDistance: number
}

export function useDistance({
  speed,
}: DistanceProps): [State, React.Dispatch<Action>] {
  // Distance is in meters. Speed is in meters per second.
  const { units } = useUnits()
  const [lastTs, setLastTs] = useState<Date>(new Date())
  const [rawDistance, setRawDistance] = useState<number>(0)

  const [state, dispatch] = useReducer(
    (state: State, action: Action): State => {
      switch (action.type) {
        case 'reset':
          setRawDistance(0)
          return { rawDistance: 0, displayDistance: 0 }
        case 'resumeBreak':
          setLastTs(action.payload.timestamp)
          return state
        case 'update':
          const { timestamp } = action.payload
          setLastTs(timestamp)
          if (speed) {
            const timeDiff = timestamp.getTime() - lastTs.getTime()
            const newRawDistance = speed! * (timeDiff / 1000) + rawDistance
            setRawDistance(newRawDistance)
            let newDisplayDistance =
              newRawDistance *
              (units.distance === 'kilometers' ? 0.001 : 0.000621)
            newDisplayDistance =
              Math.round((newDisplayDistance + Number.EPSILON) * 100) / 100
            return {
              rawDistance: newRawDistance,
              displayDistance: newDisplayDistance,
            }
          }
        // TODO(gigilibala): Add logic based on position too.
      }
      return state
    },
    { rawDistance: 0, displayDistance: 0 },
  )

  return [state, dispatch]
}
