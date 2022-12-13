import React from 'react'
import { useTranslation } from 'react-i18next'
import { useUnits } from '../../hooks/units'
import { ProgressInfoCard } from './ProgressInfoCard'

type DistanceCardProps = {
  lapDistance: string
  totalDistance: string
}

export function DistanceCard({
  lapDistance,
  totalDistance,
}: DistanceCardProps) {
  const { t } = useTranslation()
  const { units } = useUnits()

  return (
    <ProgressInfoCard
      title={t('distance')}
      color={'green'}
      unit={t(units.distance)}
      value={totalDistance}
      subValue1={{
        value: lapDistance,
        scope: t('lap'),
      }}
    />
  )
}
