import { Theme } from '@react-navigation/native'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useStyles } from '../../hooks/styles'
import { ProgressCard } from './ProgressCard'
import { ProgressInfoCard } from './ProgressInfoCard'

type HeartRateCardProps = {
  heartRate?: number
  onPressConnectDevice: () => void
}

export function HeartRateCard({
  heartRate,
  onPressConnectDevice,
}: HeartRateCardProps) {
  const styles = useStyles(createStyles)

  return heartRate ? (
    <ProgressInfoCard
      title={'Heart Rate'}
      color={'red'}
      unit={'BPM'}
      value={heartRate || 'N/A'}
      subValue1={{ value: heartRate || 'N/A', scope: 'Lap' }}
    />
  ) : (
    <ProgressCard title={'Heart Rate'} color={'red'} unit={'BPM'}>
      <View style={{ justifyContent: 'center', flexGrow: 1 }}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => onPressConnectDevice()}
        >
          <Text style={styles.buttonText}>Connect Device</Text>
        </TouchableOpacity>
      </View>
    </ProgressCard>
  )
}

const createStyles = (theme: Theme) => StyleSheet.create({})
