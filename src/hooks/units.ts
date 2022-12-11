import { useContext, useEffect, useState } from 'react'
import { PreferencesContext } from '../components/providers/PreferencesProvider'

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

  useEffect(() => {
    setSpeedUnitStr(speedUnit(units))
  }, [units])

  return { units, speedUnitStr }
}

export type Milliseconds = number
export function duration(d: Milliseconds): string {
  return new Date(d).toISOString().substring(14, 19)
}
