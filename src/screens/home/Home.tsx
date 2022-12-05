import { Picker } from '@react-native-picker/picker'
import { Theme } from '@react-navigation/native'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { ActivityType, ACTIVITY_TYPES } from '../../components/ActivityTypes'
import { BUTTON_SIZE, useStyles } from '../../hooks/styles'
import { HomeScreenProps } from '../RootNavigator'

export default function Home({ navigation }: HomeScreenProps<'Home'>) {
  const styles = useStyles(createStyles)
  const { t, i18n } = useTranslation()
  const [activityType, setActivityType] = useState<ActivityType>('running')

  const startButton = (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('ActivityInProgress', {
          activityParams: { type: activityType },
        })
      }
    >
      <Icon name={'play-circle'} size={BUTTON_SIZE} color={'green'} />
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={[styles.safeAreaView, styles.verticalContainer]}>
      <View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            i18n.language === 'en'
              ? i18n.changeLanguage('it')
              : i18n.changeLanguage('en')
          }}
        >
          <Text style={styles.buttonText}>{t('test')}</Text>
        </TouchableOpacity>

        <View>
          <Picker
            selectedValue={activityType}
            onValueChange={(value) => {
              setActivityType(value)
            }}
          >
            {ACTIVITY_TYPES.map((type) => (
              <Picker.Item
                label={t(`activityType.${type}`)}
                value={type}
                key={type}
              />
            ))}
          </Picker>
        </View>
      </View>
      <View style={[styles.activityButtonView, { justifyContent: 'center' }]}>
        {startButton}
      </View>
    </SafeAreaView>
  )
}

const createStyles = (theme: Theme) => StyleSheet.create({})
