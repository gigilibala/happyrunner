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
import { DatabaseContext } from '../../components/providers/DatabaseProvider'
import { Details } from '../../hooks/activity'
import { rawDistanceToDisplayDistance } from '../../hooks/distance'
import { useStyles } from '../../hooks/styles'
import { useUnits } from '../../hooks/units'
import { HistoryScreenProps } from '../RootNavigator'

export function History({ navigation }: HistoryScreenProps<'History'>) {
  const { t } = useTranslation()
  const styles = useStyles(createStyles)
  const [dbState, dbDispatch] = useContext(DatabaseContext)
  const [activityList, setActivityList] = useState<Details[]>()
  const { units } = useUnits()

  useFocusEffect(
    useCallback(() => {
      dbDispatch({ type: 'getActivityDetailsList' })
    }, []),
  )

  useEffect(() => {
    if (
      dbState.status === 'success' &&
      dbState.actionType === 'getActivityDetailsList'
    )
      setActivityList(dbState.payload.details)
  }, [dbState])

  function ActivityItem({ detail }: { detail: Details }) {
    const date = new Date(detail.start_time).toLocaleString('en-us', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 60,
          },
        ]}
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
            <Text style={styles.text}>{date}</Text>
          </View>
          {detail.distance && (
            <View>
              <Text style={[styles.text, { color: 'olive' }]}>
                {rawDistanceToDisplayDistance(detail.distance, units)}{' '}
                {t(units.distance)}
              </Text>
            </View>
          )}
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
    activityDetailsView: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
  })
