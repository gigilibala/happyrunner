import React from 'react'
import { useTranslation } from 'react-i18next'
import { useUnits } from '../../hooks/units'
import { ProgressInfoCard } from './ProgressInfoCard'

type DurationCardProps = {
  lap: string
  total: string
}

export function DurationCard({ lap, total }: DurationCardProps) {
  const { t } = useTranslation()
  const { units } = useUnits()

  return (
    <ProgressInfoCard
      title={t('duration')}
      color={'darkorange'}
      value={total}
      subValue1={{
        value: lap,
        scope: t('lap'),
      }}
    />
  )
}
