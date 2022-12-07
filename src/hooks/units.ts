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
      return 'Min/K'
    } else {
      return 'K/h'
    }
  } else {
    if (units.speed === 'pace') {
      return 'Min/M'
    } else {
      return 'M/h'
    }
  }
}

export function useUnits() {
  const { usePrefState } = useContext(PreferencesContext)
  const [units] = usePrefState('units')
  const [speedUnitStr, setSpeedUnitStr] = useState<string>('Min/M')

  useEffect(() => {
    setSpeedUnitStr(speedUnit(units))
  }, [units])

  return { units, speedUnitStr }
}
