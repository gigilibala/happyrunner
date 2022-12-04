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
import { useStyles } from '../../common/styles'
import { ActivityIcon } from '../../components/ActivityTypes'
import { DatabaseContext } from '../../components/providers/DatabaseProvider'
import { Details } from '../../hooks/activity'
import { HistoryScreenProps } from '../RootNavigator'

export function History({ navigation }: HistoryScreenProps<'History'>) {
  const { t } = useTranslation()
  const styles = useStyles(createStyles)
  const [dbState, dbDispatch] = useContext(DatabaseContext)
  const [activityList, setActivityList] = useState<Details[]>()

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
        <View>
          <Text style={styles.text}>{date}</Text>
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

const createStyles = (theme: Theme) => StyleSheet.create({})
