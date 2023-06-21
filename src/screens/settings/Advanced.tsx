import { Theme } from '@react-navigation/native'
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView, StyleSheet } from 'react-native'
import { Button, Dialog, List, Portal, Text } from 'react-native-paper'
import { DatabaseContext } from '../../components/providers/DatabaseProvider'
import { useStyles } from '../../hooks/useStyles'
import { SettingsScreenProps } from '../RootNavigator'

export function Advanced({}: SettingsScreenProps<'Advanced'>) {
  const styles = useStyles(createStyles)
  const { t } = useTranslation()
  const [_, dbDispatch] = useContext(DatabaseContext)
  const [showClearDatabaseDialog, setShowClearDatabaseDialog] =
    useState<boolean>(false)
  const closeClearDatabaseDialog = () => setShowClearDatabaseDialog(false)

  return (
    <SafeAreaView>
      <List.Item
        title={t('clearDatabase')}
        description={'TODO size of database'}
        left={({ color, style }) => (
          <List.Icon icon={'database'} color={color} style={style} />
        )}
        onPress={() => setShowClearDatabaseDialog(true)}
      />
      <Portal>
        <Dialog
          visible={showClearDatabaseDialog}
          onDismiss={closeClearDatabaseDialog}
        >
          <Dialog.Title>{t('alert')}</Dialog.Title>
          <Dialog.Content>
            <Text variant='bodyMedium'>{t('clearDatabaseNotice')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                dbDispatch({ type: 'clearDatabase' })
                closeClearDatabaseDialog()
              }}
            >
              {t('yes')}
            </Button>
            <Button onPress={closeClearDatabaseDialog}>{t('cancel')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  )
}

const createStyles = (theme: Theme) => StyleSheet.create({})
