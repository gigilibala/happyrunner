import { Theme } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { SafeAreaView, StyleSheet, Text } from 'react-native'
import { useStyles } from '../../common/styles'
import { Props } from '../RootNavigator'

export function About({ route, navigation }: Props<'About'>) {
  const styles = useStyles(createStyles)
  const { t } = useTranslation()

  return (
    <SafeAreaView>
      <Text style={styles.text}>{t('about')}</Text>
    </SafeAreaView>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    text: {
      color: theme.colors.text,
    },
  })
