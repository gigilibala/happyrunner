import { Theme } from '@react-navigation/native'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { DisplaySpeed } from '../../hooks/useSpeed'
import { useStyles } from '../../hooks/useStyles'
import { useUnits } from '../../hooks/useUnits'
import { ProgressCard } from './ProgressCard'

type SpeedInputCardProps = {
  speed: DisplaySpeed
  onSpeedIncrease: () => void
  onSpeedDecrease: () => void
}

export function SpeedInputCard({
  speed,
  onSpeedDecrease,
  onSpeedIncrease,
}: SpeedInputCardProps) {
  const styles = useStyles(createStyles)
  const { t } = useTranslation()

  const { units, speedUnitStr } = useUnits()
  const [pressInterval, setPressInterval] = useState<number>()

  return (
    <ProgressCard title={t(units.speed)} color={'cyan'} unit={speedUnitStr}>
      <View style={{ justifyContent: 'space-around', flex: 1, flexGrow: 1 }}>
        <TouchableOpacity
          style={[styles.button, { height: '20%' }]}
          onPressIn={() => setPressInterval(setInterval(onSpeedIncrease, 100))}
          onPressOut={() => clearInterval(pressInterval!)}
        >
          <Icon name={'plus'} />
        </TouchableOpacity>
        <View style={[styles.textView, { height: '60%' }]}>
          <Text
            style={[
              styles.largestText,
              styles.boldText,
              { includeFontPadding: false },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
          >
            {speed}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.button, { height: '20%' }]}
          onPressIn={() => setPressInterval(setInterval(onSpeedDecrease, 100))}
          onPressOut={() => clearInterval(pressInterval!)}
        >
          <Icon name={'minus'} />
        </TouchableOpacity>
      </View>
    </ProgressCard>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    textView: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  })
