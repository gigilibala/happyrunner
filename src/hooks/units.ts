import { useContext, useEffect, useState } from 'react'
import { PreferencesContext } from '../components/providers/PreferencesProvider'

type Distance = 'miles' | 'kilometers'
type Speed = 'pace' | 'speed'

export interface Units {
  distance: Distance
  speed: Speed
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
