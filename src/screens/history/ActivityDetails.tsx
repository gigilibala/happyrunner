import { Theme } from '@react-navigation/native'
import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { BUTTON_SIZE, useStyles } from '../../common/styles'
import { DatabaseContext } from '../../hooks/DatabaseProvider'
import { HistoryScreenProps } from '../RootNavigator'

export default function ActivityDetails({
  route,
  navigation,
}: HistoryScreenProps<'ActivityDetails'>) {
  const styles = useStyles(createStyles)
  const { t } = useTranslation()
  const { activityId } = route.params
  const { modifyActivity, getActivityLaps } = useContext(DatabaseContext)
  const [notes, setNotes] = useState<string>('')

  const saveButton = (
    <TouchableOpacity
      onPress={() => {
        modifyActivity({ id: activityId, notes: notes })
        navigation.popToTop()
      }}
    >
      <Icon name={'save'} size={BUTTON_SIZE} color={'blue'} />
    </TouchableOpacity>
  )

  const discardButton = (
    <TouchableOpacity onPress={() => {}}>
      <Icon name={'trash-alt'} size={BUTTON_SIZE - 5} color={'red'} />
    </TouchableOpacity>
  )

  return (
    <SafeAreaView
      style={[styles.safeAreaView, { justifyContent: 'space-between' }]}
    >
      <View>
        <Text style={[styles.largeText]}>{t('notes')}</Text>
        <TextInput
          multiline={true}
          value={notes}
          onChangeText={setNotes}
          textAlignVertical={'top'}
          style={[styles.textInput, styles.card, styles.shadow]}
        />
      </View>
      <View style={styles.activityButtonView}>
        {discardButton}
        {saveButton}
      </View>
    </SafeAreaView>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    textInput: {
      height: '50%',
    },
  })
