import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PreferencesContext } from '../components/providers/PreferencesProvider'
import { RawSpeed } from './speed'

export interface Units {
  distance: 'miles' | 'kilometers'
  speed: 'pace' | 'speed'
}

function speedUnit(units: Units): string {
  if (units.distance === 'kilometers') {
    if (units.speed === 'pace') {
      return 'min/k'
    } else {
      return 'k/h'
    }
  } else {
    if (units.speed === 'pace') {
      return 'min/mile'
    } else {
      return 'm/h'
    }
  }
}

export function useUnits() {
  const { usePrefState } = useContext(PreferencesContext)
  const [units] = usePrefState('units')
  const [speedUnitStr, setSpeedUnitStr] = useState<string>()
  const { i18n } = useTranslation()

  useEffect(() => {
    setSpeedUnitStr(speedUnit(units))
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
      return durationHours(Math.round(revertPace(speed) * 60000))[0]
    }
  }

  // Converts between pace and raw speed.
  function revertPace(speed: number): number {
    if (speed === 0) return 0
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

  function calculateDistance(value: number): string {
    const distanceInUnit =
      value / (units.distance === 'kilometers' ? 1000 : 1609)
    return (Math.round((distanceInUnit + Number.EPSILON) * 100) / 100).toFixed(
      2,
    )
  }

  return {
    units,
    speedUnitStr,
    calculateDisplaySpeed,
    revertPace,
    changeSpeed,
    calculateDistance,
  }
}

export type Milliseconds = number

export function durationHours(d: Milliseconds): [string, boolean] {
  const date = new Date(d)
  const hasHours = date.getUTCHours() > 0
  const index = hasHours ? 11 : 14
  return [date.toISOString().substring(index, 19), hasHours]
}
