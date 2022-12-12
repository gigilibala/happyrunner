import { useEffect, useReducer } from 'react'
import { useUnits } from './units'

export type RawSpeed = number // Meters per milliseconds
export type DisplaySpeed = string

type Action = { type: 'increase' | 'decrease' | 'changeUnit' }
type State = { rawSpeed: RawSpeed; displaySpeed: DisplaySpeed }

export function useSpeed(): [State, React.Dispatch<Action>] {
  const { units, calculateDisplaySpeed, changeSpeed } = useUnits()

  const [state, dispatch] = useReducer(
    (state: State, action: Action): State => {
      switch (action.type) {
        case 'increase': {
          const rawSpeed = changeSpeed(state.rawSpeed, (a, b) => a + b)
          return {
            rawSpeed,
            displaySpeed: calculateDisplaySpeed(rawSpeed),
          }
        }
        case 'decrease': {
          let rawSpeed = changeSpeed(state.rawSpeed, (a, b) => a - b)
          if (rawSpeed <= 0) rawSpeed = 0
          return {
            rawSpeed,
            displaySpeed: calculateDisplaySpeed(rawSpeed),
          }
        }
        case 'changeUnit':
          return {
            ...state,
            displaySpeed: calculateDisplaySpeed(state.rawSpeed),
          }
      }
    },
    2.68,
    (speed): State => {
      return { rawSpeed: speed, displaySpeed: calculateDisplaySpeed(speed) }
    },
  )

  useEffect(() => {
    dispatch({ type: 'changeUnit' })
  }, [units])

  return [state, dispatch]
}
