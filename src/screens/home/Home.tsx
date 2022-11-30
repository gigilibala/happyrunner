import { Theme } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { Button, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { BUTTON_SIZE, useStyles } from '../../common/styles'
import { HomeScreenProps } from '../RootNavigator'

export default function Home({ navigation }: HomeScreenProps<'Home'>) {
  const styles = useStyles(createStyles)
  const { t, i18n } = useTranslation()

  const startButton = (
    <TouchableOpacity onPress={() => navigation.navigate('ActivityInProgress')}>
      <Icon name={'play-circle'} size={BUTTON_SIZE} color={'green'} />
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={[styles.safeAreaView, styles.verticalContainer]}>
      <View style={styles.button}>
        <Button
          title={t('test')}
          onPress={() => {
            i18n.language === 'en'
              ? i18n.changeLanguage('it')
              : i18n.changeLanguage('en')
          }}
        />
      </View>
      <View style={[styles.activityButtonView, { justifyContent: 'center' }]}>
        {startButton}
      </View>
    </SafeAreaView>
  )
}

const createStyles = (theme: Theme) => StyleSheet.create({})
