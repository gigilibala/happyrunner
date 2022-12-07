import { Theme } from '@react-navigation/native'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useStyles } from '../../hooks/styles'
import { useUnits } from '../../hooks/units'
import { ProgressCard } from './ProgressCard'

export function SpeedInputCard() {
  const styles = useStyles(createStyles)
  const { t } = useTranslation()

  const { units, speedUnitStr } = useUnits()
  const [speedKh, setSpeedKh] = useState<number>(1)

  return (
    <ProgressCard title={t(units.speed)} color={'cyan'} unit={speedUnitStr}>
      <View style={{ flexGrow: 1, justifyContent: 'space-between' }}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setSpeedKh((prev) => prev + 1)}
        >
          <Icon name="plus" />
        </TouchableOpacity>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text style={[styles.largestText, styles.boldText]}>{speedKh}</Text>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setSpeedKh((prev) => prev - 1)}
        >
          <Icon name="minus" />
        </TouchableOpacity>
      </View>
    </ProgressCard>
  )
}

const createStyles = (theme: Theme) => StyleSheet.create({})
