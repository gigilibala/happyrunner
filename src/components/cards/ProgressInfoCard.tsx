import { Theme } from '@react-navigation/native'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useStyles } from '../../hooks/useStyles'
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
        <Text
          style={[
            styles.largerText,
            styles.boldText,
            { includeFontPadding: false },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit={true}
        >
          {props.value}
        </Text>
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
      <View style={[styles.valuesView]}>
        <View style={[styles.valueView]}>
          <Text
            style={[
              styles.largestText,
              styles.boldText,
              { includeFontPadding: false },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
          >
            {props.value}
          </Text>
        </View>
        <View style={styles.valueView}>
          {props.subValue1 ? <ScopedValue {...props.subValue1} /> : null}
          {props.subValue2 ? <ScopedValue {...props.subValue2} /> : null}
        </View>
      </View>
    </ProgressCard>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    valuesView: {
      justifyContent: 'space-evenly',
      alignItems: 'center',
      flex: 1,
      flexGrow: 1,
    },
    valueView: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    subValueRowView: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      width: '100%',
      flex: 1,
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
