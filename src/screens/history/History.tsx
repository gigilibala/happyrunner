import { Theme, useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import { List } from 'react-native-paper'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { ActivityIcon } from '../../components/ActivityTypes'
import {
  DatabaseContext,
  Details,
} from '../../components/providers/DatabaseProvider'
import { useStyles } from '../../hooks/useStyles'
import { durationHours, useUnits } from '../../hooks/useUnits'
import { HistoryScreenProps } from '../RootNavigator'

export function History({ navigation }: HistoryScreenProps<'History'>) {
  const { t } = useTranslation()
  const styles = useStyles(createStyles)
  const [dbState, dbDispatch] = useContext(DatabaseContext)
  const [activityList, setActivityList] = useState<Details[]>()
  const { units, calculateDistance } = useUnits()

  useFocusEffect(
    useCallback(() => {
      dbDispatch({ type: 'getActivityList' })
    }, []),
  )

  useEffect(() => {
    if (
      dbState.status === 'success' &&
      dbState.payload.type === 'getActivityList'
    )
      setActivityList(dbState.payload.details)
  }, [dbState])

  function ActivityItem({ detail }: { detail: Details }) {
    const duration = detail.duration ? durationHours(detail.duration) : null
    const durationStr = duration
      ? duration[0] + ' ' + (duration[1] ? t('hours') : t('minutes'))
      : null
    const title = new Date(detail.start_time).toLocaleString('en-us', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    return (
      <List.Item
        title={title}
        description={() => (
          <View style={styles.detailsText}>
            {detail.distance ? (
              <Text style={[styles.text, { color: 'olive' }]}>
                {calculateDistance(detail.distance)} {t(units.distance)}
              </Text>
            ) : null}
            {detail.duration ? (
              <Text style={[styles.text, { color: 'cyan' }]}>
                {durationStr}
              </Text>
            ) : null}
          </View>
        )}
        left={({ color, style }) => (
          <ActivityIcon type={detail.type} color={color} style={style} />
        )}
        right={({ color, style }) => (
          <Icon name={'chevron-right'} color={color} style={style} />
        )}
        style={[styles.card]}
        onPress={() =>
          navigation.navigate('ActivityDetails', {
            activityId: detail.activity_id,
            edit: false,
          })
        }
      />
    )
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ScrollView>
        {activityList?.map((detail) => (
          <ActivityItem detail={detail} key={detail.activity_id} />
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    detailsText: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  })
