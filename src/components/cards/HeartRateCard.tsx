import React from 'react'
import { ProgressInfoCard } from './ProgressInfoCard'

type HeartRateCardProps = {
  heartRate?: number
}

export default function HeartRateCard({ heartRate }: HeartRateCardProps) {
  return (
    <ProgressInfoCard
      title={'Heart Rate'}
      color={'red'}
      unit={'BPM'}
      value={heartRate || 'N/A'}
      subValue1={{ value: heartRate || 'N/A', scope: 'Lap' }}
    />
  )
}
