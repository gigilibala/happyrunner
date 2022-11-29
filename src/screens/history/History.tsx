import { Theme } from '@react-navigation/native'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useStyles } from '../../common/styles'
import { Details } from '../../hooks/Activity'
import { DatabaseContext } from '../../hooks/DatabaseProvider'

import { Props } from '../RootNavigator'

export function History({}: Props<'History'>) {
  const { t } = useTranslation()
  const styles = useStyles(createStyles)
  const { getActivityDetailsList } = useContext(DatabaseContext)

  const [activityList, setActivityList] = useState<Details[]>()
  useEffect(() => {
    getActivityDetailsList().then((detailsList) => setActivityList(detailsList))
  }, [])

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ScrollView>
        {activityList?.map((detail) => (
          <TouchableOpacity key={detail.activity_id}>
            <View>
              <Text>{detail.activity_id}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const createStyles = (theme: Theme) => StyleSheet.create({})
