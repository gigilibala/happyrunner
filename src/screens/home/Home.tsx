import { Theme } from '@react-navigation/native'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'
import { Dialog, FAB, List } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  ACTIVITY_TYPES,
  ActivityIcon,
  ActivityType,
} from '../../components/ActivityTypes'
import { useStyles } from '../../hooks/styles'
import { HomeScreenProps } from '../RootNavigator'

export default function Home({ navigation }: HomeScreenProps<'Home'>) {
  const styles = useStyles(createStyles)
  const { t, i18n } = useTranslation()
  const [activityType, setActivityType] = useState<ActivityType>('running')
  const [showWorkoutDialog, setShowWorkoutDialog] = useState<boolean>(false)
  const [showWorkoutFab, setShowWorkoutFab] = useState<boolean>(false)
  const activityStr = t(`activityType.${activityType}`)

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <Dialog
        visible={showWorkoutDialog}
        onDismiss={() => setShowWorkoutDialog(false)}
      >
        <Dialog.Content>
          {ACTIVITY_TYPES.map((type) => (
            <List.Item
              key={type}
              title={t(`activityType.${type}`)}
              left={({ color, style }) => ActivityIcon({ type, color })}
              onPress={() => {
                setShowWorkoutDialog(false)
                setActivityType(type)
                navigation.navigate('ActivityInProgress', {
                  type: type,
                })
              }}
            />
          ))}
        </Dialog.Content>
      </Dialog>
      <FAB.Group
        icon={showWorkoutFab ? 'close' : 'plus'}
        open={showWorkoutFab}
        onStateChange={(state) => {
          setShowWorkoutFab(state.open)
        }}
        visible={!showWorkoutDialog}
        onPress={() => setShowWorkoutFab((prev) => !prev)}
        actions={[
          {
            label: activityStr,
            icon: ({ size, color }) =>
              ActivityIcon({ type: activityType, size, color }),
            onPress: () => {
              navigation.navigate('ActivityInProgress', {
                type: activityType,
              })
            },
          },
          {
            label: t('choose'),
            icon: 'arrow-decision',
            onPress: () => {
              setShowWorkoutDialog(true)
            },
          },
        ]}
      />
    </SafeAreaView>
  )
}

const createStyles = (theme: Theme) => StyleSheet.create({})
