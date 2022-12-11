import { useEffect, useReducer } from 'react'
import { useTranslation } from 'react-i18next'
import { duration, useUnits } from './units'

export type RawSpeed = number // Meters per milliseconds
export type DisplaySpeed = string

type Action = { type: 'increase' | 'decrease' | 'changeUnit' }
type State = { rawSpeed: RawSpeed; displaySpeed: DisplaySpeed }

export function useSpeed(): [State, React.Dispatch<Action>] {
  const { i18n } = useTranslation()
  const { units } = useUnits()

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

  function calculateDisplaySpeed(speed: RawSpeed): string {
    if (units.speed === 'speed') {
      let displaySpeed =
        speed * (units.distance === 'kilometers' ? 3.6 : 2.23694)
      displaySpeed = Math.round((displaySpeed + Number.EPSILON) * 10) / 10
      return displaySpeed.toLocaleString(i18n.language, {
        minimumFractionDigits: 1,
      })
    } else {
      // First make it to milliseconds.
      return duration(Math.round(revertPace(speed) * 60000))
    }
  }

  // Converts between pace and raw speed.
  function revertPace(speed: number): number {
    return (units.distance === 'kilometers' ? 1000 : 1609) / (speed * 60)
  }

  function changeSpeed(
    speed: number,
    op: (a: number, b: number) => number,
  ): number {
    if (units.speed === 'speed') {
      return op(speed, units.distance === 'kilometers' ? 1 / 36 : 2 / 45)
    } else {
      // '1 / 6' is 10 seconds of a minute.
      return revertPace(op(revertPace(speed), 1 / 6))
    }
  }

  return [state, dispatch]
}
