import { Theme } from '@react-navigation/native'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, SafeAreaView, StyleSheet } from 'react-native'
import { Button } from 'react-native-paper'
import { DatabaseContext } from '../../components/providers/DatabaseProvider'
import { useStyles } from '../../hooks/styles'
import { SettingsScreenProps } from '../RootNavigator'

export function Advanced({}: SettingsScreenProps<'Advanced'>) {
  const styles = useStyles(createStyles)
  const { t } = useTranslation()
  const [_, dbDispatch] = useContext(DatabaseContext)

  return (
    <SafeAreaView>
      <Button
        icon={'database'}
        mode={'contained'}
        onPress={() => {
          Alert.alert(
            t('clearDatabase'),
            t('clearDatabaseNotice'),
            [
              {
                text: t('yes'),
                onPress: () => dbDispatch({ type: 'clearDatabase' }),
                style: 'destructive',
              },
              { text: t('cancel'), style: 'cancel' },
            ],
            { cancelable: true },
          )
        }}
      >
        Clear Database
      </Button>
    </SafeAreaView>
  )
}

const createStyles = (theme: Theme) => StyleSheet.create({})
