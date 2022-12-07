import { Theme } from '@react-navigation/native'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useStyles } from '../../hooks/styles'
import { ProgressCard, ProgressCardProps } from './ProgressCard'

type Value = string | number
type SubValue = {
  value: Value
  scope: string
}
type ProgressInfoCardProps = ProgressCardProps & {
  value: Value
  subValue1?: SubValue
  subValue2?: SubValue
}

function ScopedValue(props: SubValue) {
  const styles = useStyles(createStyles)

  return (
    <View style={styles.subValueRowView}>
      <View style={styles.scopeView} />
      <View style={styles.subValueView}>
        <Text style={[styles.largeText, styles.boldText]}>{props.value}</Text>
      </View>
      <View style={styles.scopeView}>
        <Text style={[styles.text, styles.boldText]}>{props.scope}</Text>
      </View>
    </View>
  )
}

export function ProgressInfoCard(props: ProgressInfoCardProps) {
  const styles = useStyles(createStyles)

  return (
    <ProgressCard {...props}>
      <View style={styles.valuesView}>
        <View>
          <Text style={[styles.text, styles.boldText, { fontSize: 50 }]}>
            {props.value}
          </Text>
        </View>
        {props.subValue1 && <ScopedValue {...props.subValue1} />}
        {props.subValue2 && <ScopedValue {...props.subValue2} />}
      </View>
    </ProgressCard>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    valuesView: {
      justifyContent: 'space-evenly',
      alignItems: 'center',
      flexGrow: 1,
    },
    subValueRowView: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      width: '100%',
    },
    subValueView: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '60%',
    },
    scopeView: {
      width: '20%',
    },
  })
