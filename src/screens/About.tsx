import { Theme, useTheme } from '@react-navigation/native'
import { useMemo } from 'react'
import { SafeAreaView, StyleSheet, Text } from 'react-native'
import { Props } from './navigators/SettingsStack'

export function About({ route, navigation }: Props<'About'>) {
  const theme = useTheme()
  const styles = useMemo(() => createStyles(theme), [theme])

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
