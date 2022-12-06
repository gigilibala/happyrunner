import { Theme } from '@react-navigation/native'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useStyles } from '../hooks/styles'

type Value = string | number
type SubValue = {
  value: Value
  scope: string
}
type HarizontalCardInfo = {
  title: string
  color: string
  unit: string
  value: Value
  subValue1?: SubValue
  subValue2?: SubValue
}

export default function HarizontalCard(props: HarizontalCardInfo) {
  const styles = useStyles(createStyles)

  function renderScopedValue(value: SubValue) {
    return (
      <View style={styles.subValueRowView}>
        <View style={styles.scopeView} />
        <View style={styles.subValueView}>
          <Text style={[styles.largeText, styles.boldText]}>{value.value}</Text>
        </View>
        <View style={styles.scopeView}>
          <Text style={[styles.text, styles.boldText]}>{value.scope}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.activityInfoView, styles.shadow]}>
      <View style={[styles.titleView, { backgroundColor: props.color }]}>
        <View>
          <Text style={styles.mediumText}>{props.title}</Text>
        </View>
        <View>
          <Text style={styles.text}>{props.unit}</Text>
        </View>
      </View>
      <View style={styles.valuesView}>
        <View>
          <Text style={[styles.text, styles.boldText, { fontSize: 50 }]}>
            {props.value}
          </Text>
        </View>
        {props.subValue1 && renderScopedValue(props.subValue1)}
        {props.subValue2 && renderScopedValue(props.subValue2)}
      </View>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    titleView: {
      alignItems: 'center',
      borderTopEndRadius: 5,
      borderTopStartRadius: 5,
      width: '100%',
      justifyContent: 'space-evenly',
      flexDirection: 'row',
    },
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
