import { Theme } from '@react-navigation/native'
import React, { PropsWithChildren } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useStyles } from '../../hooks/useStyles'

export type ProgressCardProps = {
  title: string
  color: string
  unit?: string
}

export function ProgressCard(props: PropsWithChildren<ProgressCardProps>) {
  const styles = useStyles(createStyles)
  return (
    <View style={[styles.activityCardView, styles.shadow]}>
      <View style={[styles.titleView, { backgroundColor: props.color }]}>
        <View>
          <Text style={styles.mediumText}>{props.title}</Text>
        </View>
        {props.unit ? (
          <View>
            <Text style={styles.text}>{props.unit}</Text>
          </View>
        ) : null}
      </View>
      {props.children}
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    activityCardView: {
      backgroundColor: theme.colors.card,
      width: '48%',
      height: '32%',
      borderRadius: 5,
    },
    titleView: {
      alignItems: 'center',
      borderTopEndRadius: 5,
      borderTopStartRadius: 5,
      width: '100%',
      justifyContent: 'space-evenly',
      flexDirection: 'row',
    },
  })
