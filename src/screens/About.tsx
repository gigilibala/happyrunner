import { Theme } from '@react-navigation/native'
import { SafeAreaView, StyleSheet, Text } from 'react-native'
import { useStyles } from '../common/styles'
import { Props } from './navigators/RootNavigator'

export function About({ route, navigation }: Props<'About'>) {
  const styles = useStyles(createStyles)

  return (
    <SafeAreaView>
      <Text style={styles.text}>Hello world! I wrote this App</Text>
    </SafeAreaView>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    text: {
      color: theme.colors.text,
    },
  })
