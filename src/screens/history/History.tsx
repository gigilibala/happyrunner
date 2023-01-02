import { Theme, useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { ActivityIcon } from '../../components/ActivityTypes'
import {
  DatabaseContext,
  Details,
} from '../../components/providers/DatabaseProvider'
import { useStyles } from '../../hooks/styles'
import { durationHours, useUnits } from '../../hooks/units'
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
    return (
      <TouchableOpacity
        style={[styles.card, styles.item]}
        onPress={() =>
          navigation.navigate('ActivityDetails', {
            activityId: detail.activity_id,
            edit: false,
          })
        }
      >
        <ActivityIcon type={detail.type} size={30} />
        <View style={styles.activityDetailsView}>
          <View>
            <Text style={styles.text}>
              {new Date(detail.start_time).toLocaleString('en-us', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
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
        </View>
        <Icon name={'chevron-right'} color={'grey'} />
      </TouchableOpacity>
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
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 60,
    },
    activityDetailsView: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      flexGrow: 1,
      flex: 1,
    },
    detailsText: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      width: '90%',
    },
  })
