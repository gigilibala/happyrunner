import { Theme } from '@react-navigation/native'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useStyles } from '../common/styles'

type ValueWithScope = {
  value: string | number
  scope?: string
}

type HarizontalCardInfo = {
  title: string
  color: string
  unit: string
  value1: string | number
  value2?: ValueWithScope
  value3?: ValueWithScope
}

export default function HarizontalCard(props: HarizontalCardInfo) {
  const styles = useStyles(createStyles)

  function renderScopedValue(value: ValueWithScope) {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <View>
          <Text style={styles.largeText}>{value.value}</Text>
        </View>
        {value.scope && (
          <View style={styles.unitOrScopeView}>
            <Text style={styles.text}>{value.scope}</Text>
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={[styles.containerView, styles.shadow]}>
      <View style={[styles.titleView, { backgroundColor: props.color }]}>
        <View>
          <Text style={styles.mediumText}>{props.title}</Text>
        </View>
        <View style={styles.unitOrScopeView}>
          <Text style={styles.text}>{props.unit}</Text>
        </View>
      </View>
      <View style={styles.valueView}>
        <View style={styles.valueBreakView}>
          <Text style={[styles.text, { fontWeight: 'bold', fontSize: 50 }]}>
            {props.value1}
          </Text>
        </View>
        <View style={styles.valueBreakView}>
          {props.value2 && renderScopedValue(props.value2)}
          {props.value3 && renderScopedValue(props.value3)}
        </View>
      </View>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    containerView: {
      backgroundColor: theme.colors.card,
      width: '98%',
      alignItems: 'center',
      borderRadius: 5,
      margin: 1,
      flexDirection: 'column',
      flex: 1,
    },
    titleView: {
      alignItems: 'center',
      borderRadius: 5,
      width: '100%',
      justifyContent: 'center',
    },
    valueView: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      width: '100%',
    },
    valueBreakView: {
      width: '50%',
      alignItems: 'center',
    },
    unitOrScopeView: {
      right: 10,
      position: 'absolute',
    },
  })
