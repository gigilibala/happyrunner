import { useEffect, useReducer, useState } from 'react'
import { useUnits } from './units'

const DISPLAY_CHANGE_VALUE = 0.1

type Action = { type: 'increase' | 'decrease' | 'changeUnit' }
type State = { rawSpeed: number; displaySpeed: number }

export function useSpeed(): [State, React.Dispatch<Action>] {
  const { units } = useUnits()
  const [rawSpeed, setRawSpeed] = useState<number>(1)

  const [state, dispatch] = useReducer(
    (state: State, action: Action): State => {
      switch (action.type) {
        case 'increase': {
          const newRawSpeed = toRawSpeed(
            state.displaySpeed + DISPLAY_CHANGE_VALUE,
          )
          setRawSpeed(newRawSpeed)
          return {
            rawSpeed: newRawSpeed,
            displaySpeed: calculateDisplaySpeed(newRawSpeed),
          }
        }
        case 'decrease': {
          const newRawSpeed = toRawSpeed(
            state.displaySpeed - DISPLAY_CHANGE_VALUE,
          )
          setRawSpeed(newRawSpeed)
          return {
            rawSpeed: newRawSpeed,
            displaySpeed: calculateDisplaySpeed(newRawSpeed),
          }
        }
        case 'changeUnit':
          return { rawSpeed, displaySpeed: calculateDisplaySpeed(rawSpeed) }
      }
    },
    { rawSpeed: rawSpeed, displaySpeed: calculateDisplaySpeed(rawSpeed) },
  )

  useEffect(() => {
    dispatch({ type: 'changeUnit' })
  }, [units])

  function calculateDisplaySpeed(speed: number): number {
    return Math.round((toDisplaySpeed(speed) + Number.EPSILON) * 10) / 10
  }
  function toDisplaySpeed(speed: number): number {
    if (speed <= 0) return 0
    if (units.speed === 'speed') {
      if (units.distance === 'kilometers') {
        return speed * 3.6
      } else {
        return speed * 2.23694
      }
    } else {
      if (units.distance === 'kilometers') {
        return 16.666666667 / speed
      } else {
        return 26.8224 / speed
      }
    }
  }

  function toRawSpeed(speed: number): number {
    if (speed <= 0) return 0
    if (units.speed === 'speed') {
      if (units.distance === 'kilometers') {
        return speed / 3.6
      } else {
        return speed / 2.23694
      }
    } else {
      if (units.distance === 'kilometers') {
        return 16.666666667 / speed
      } else {
        return 26.8224 / speed
      }
    }
  }

  return [state, dispatch]
}
