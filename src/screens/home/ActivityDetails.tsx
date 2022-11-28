import { Theme } from '@react-navigation/native'
import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useStyles } from '../../common/styles'
import { DatabaseContext } from '../../hooks/DatabaseProvider'
import { Props } from '../RootNavigator'

export default function ActivityDetails({
  route,
  navigation,
}: Props<'Activity Details'>) {
  const styles = useStyles(createStyles)
  const { t } = useTranslation()
  const { activityId } = route.params
  const { getLaps } = useContext(DatabaseContext)
  const [notes, setNotes] = useState<string>('')

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
          textAlignVertical="top"
          style={[styles.textInput, styles.card, styles.shadow]}
        />
      </View>
      <View>
        <View style={styles.button}>
          <Button
            title={'Resume'}
            color={'orange'}
            onPress={() => navigation.pop()}
          />
        </View>
        <View style={styles.button}>
          <Button
            title={'Save'}
            color={'green'}
            onPress={() => navigation.popToTop()}
          />
        </View>
        <View style={styles.button}>
          <Button
            title={'Discard'}
            color={'red'}
            onPress={() =>
              getLaps(activityId).then((laps) => console.log(laps))
            }
          />
        </View>
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
