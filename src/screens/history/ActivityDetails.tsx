import { Theme } from '@react-navigation/native'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu'
import Icon from 'react-native-vector-icons/FontAwesome5'
import MatIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { BUTTON_SIZE, useStyles } from '../../common/styles'
import { DatabaseContext } from '../../hooks/DatabaseProvider'
import { HistoryScreenProps } from '../RootNavigator'

export default function ActivityDetails({
  route,
  navigation,
}: HistoryScreenProps<'ActivityDetails'>) {
  const styles = useStyles(createStyles)
  const { t } = useTranslation()
  const { activityId } = route.params
  const [_, dbDispatch] = useContext(DatabaseContext)
  const [notes, setNotes] = useState<string>('')
  const [editing, setEditing] = useState<boolean>(route.params.edit)

  const saveButton = (
    <TouchableOpacity
      onPress={() => {
        dbDispatch({
          type: 'modifyActivity',
          payload: {
            data: {
              id: activityId,
              notes: notes,
            },
          },
        })
        setEditing(false)
      }}
    >
      <Icon name={'save'} size={BUTTON_SIZE} color={'blue'} />
    </TouchableOpacity>
  )

  const discardButton = (
    <TouchableOpacity onPress={() => {}}>
      <Icon name={'trash-alt'} size={BUTTON_SIZE - 5} color={'red'} />
    </TouchableOpacity>
  )

  const menu = (
    <TouchableOpacity>
      <Menu>
        <MenuTrigger>
          <MatIcon name={'dots-vertical'} size={30} style={styles.threeDots} />
        </MenuTrigger>
        <MenuOptions
          customStyles={{
            optionsContainer: styles.menu,
          }}
        >
          <MenuOption onSelect={() => setEditing(true)}>
            <Text style={styles.mediumText}>{t('edit')}</Text>
          </MenuOption>
          <MenuOption onSelect={() => console.log('delete')}>
            <Text style={styles.mediumText}>{t('delete')}</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>
    </TouchableOpacity>
  )

  useEffect(() => {
    navigation.setOptions({ headerRight: (props) => menu })
  }, [])

  return (
    <SafeAreaView
      style={[styles.safeAreaView, { justifyContent: 'space-between' }]}
    >
      <View>
        <Text style={[styles.largeText]}>{t('notes')}</Text>
        {editing ? (
          <TextInput
            multiline={true}
            value={notes}
            onChangeText={setNotes}
            textAlignVertical={'top'}
            style={[styles.editNotes, styles.card, styles.shadow]}
            editable={editing}
          />
        ) : (
          <View style={styles.readNotes}>
            <Text style={styles.text}>{notes}</Text>
          </View>
        )}
      </View>
      {editing && (
        <View style={styles.activityButtonView}>
          {discardButton}
          {saveButton}
        </View>
      )}
    </SafeAreaView>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    editNotes: {
      height: '50%',
      width: '90%',
      alignSelf: 'center',
    },
    readNotes: {
      width: '90%',
      alignSelf: 'center',
    },
  })
