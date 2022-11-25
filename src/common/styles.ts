import { Theme, useTheme } from '@react-navigation/native'
import { useMemo } from 'react'
import { StyleSheet } from 'react-native'

/**
 * @usage const styles = useStyle((theme: Theme) => StyleSheet.create({example: {color: theme.color.text}}))
 *
 * @param createStyles A function that creates a style given a theme.
 * @returns merged local and global styles into one object.
 */
export function useStyles<T>(createStyles: (theme: Theme) => T) {
  const theme = useTheme()
  const globalStyles = useMemo(() => createGlobalStyles(theme), [theme])
  const localStyles = useMemo(() => createStyles(theme), [theme])
  const styles = { ...globalStyles, ...localStyles }
  return styles
}

const createGlobalStyles = (theme: Theme) =>
  StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    verticalContainer: {
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 5,
      margin: 2,
      padding: 10,
    },
    text: {
      color: theme.colors.text,
      fontSize: 20,
    },
    primaryText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
    largeText: {
      color: theme.colors.primary,
      fontSize: 25,
    },
    button: {
      margin: 10,
      elevation: 2,
    },
    shadow: {
      shadowColor: 'black',
      shadowOffset: {
        width: 2,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 0.5,
      elevation: 10,
    },
  })
