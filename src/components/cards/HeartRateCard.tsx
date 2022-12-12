import { Theme } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useStyles } from '../../hooks/styles'
import { ProgressCard } from './ProgressCard'
import { ProgressInfoCard } from './ProgressInfoCard'

type HeartRateCardProps = {
  heartRate?: number
  lapHeartRate?: number
  totalHeartRate?: number
  onPressConnectDevice: () => void
}

export function HeartRateCard({
  heartRate,
  lapHeartRate,
  totalHeartRate,
  onPressConnectDevice,
}: HeartRateCardProps) {
  const styles = useStyles(createStyles)
  const { t } = useTranslation()

  return heartRate ? (
    <ProgressInfoCard
      title={t('heartRate')}
      color={'red'}
      unit={'BPM'}
      value={heartRate || 'N/A'}
      subValue1={{ value: lapHeartRate || 'N/A', scope: t('lap') }}
      subValue2={{ value: totalHeartRate || 'N/A', scope: t('total') }}
    />
  ) : (
    <ProgressCard title={t('heartRate')} color={'red'} unit={'BPM'}>
      <View style={{ justifyContent: 'center', flexGrow: 1 }}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => onPressConnectDevice()}
        >
          <Text style={styles.buttonText}>{t('addSensor')}</Text>
        </TouchableOpacity>
      </View>
    </ProgressCard>
  )
}

const createStyles = (theme: Theme) => StyleSheet.create({})
