import { Theme } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { Button, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useStyles } from '../../common/styles'
import { Props } from '../navigators/RootNavigator'

export default function Home({ route, navigation }: Props<'Home'>) {
  const styles = useStyles(createStyles)

  const bigStartButton = (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('Active Workout')
      }}
    >
      <Icon name={'play-circle'} size={100} color={'green'} />
    </TouchableOpacity>
  )

  const { t, i18n } = useTranslation()
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
      <View style={styles.activityButtonView}>{bigStartButton}</View>
    </SafeAreaView>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    activityButtonView: {
      flexDirection: 'row',
      justifyContent: 'center',
      padding: 20,
    },
  })
