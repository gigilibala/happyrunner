import React from 'react'
import { useTranslation } from 'react-i18next'
import { DisplaySpeed } from '../../hooks/speed'
import { useUnits } from '../../hooks/units'
import { ProgressInfoCard } from './ProgressInfoCard'

type SpeedCardProps = {
  speed: DisplaySpeed
  lapSpeed: DisplaySpeed
  totalSpeed: DisplaySpeed
}

export function SpeedCard({ speed, lapSpeed, totalSpeed }: SpeedCardProps) {
  const { t } = useTranslation()
  const { units, speedUnitStr } = useUnits()

  return (
    <ProgressInfoCard
      color={'darkkhaki'}
      title={t(units.speed)}
      unit={speedUnitStr}
      value={speed}
      subValue1={{ value: lapSpeed, scope: t('lap') }}
      subValue2={{ value: totalSpeed, scope: t('total') }}
    />
  )
}
