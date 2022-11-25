import { Theme } from '@react-navigation/native'
import { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import { useStyles } from '../common/styles'

export default function VerticalCard({ children }: { children: ReactNode }) {
  const styles = useStyles(createStyles)
  return <View style={styles.containerView}>{children}</View>
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    containerView: {
      backgroundColor: theme.colors.card,
      width: '45%',
      height: '30%',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      margin: 5,
    },
  })
