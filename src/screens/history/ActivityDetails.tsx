import { Theme } from '@react-navigation/native'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { LineChart } from 'react-native-charts-wrapper'
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu'
import MatIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { DatabaseContext } from '../../components/providers/DatabaseProvider'
import { useStyles } from '../../hooks/useStyles'
import { HistoryScreenProps } from '../RootNavigator'

type Point = { x: number; y: number }

export default function ActivityDetails({
  route,
  navigation,
}: HistoryScreenProps<'ActivityDetails'>) {
  const styles = useStyles(createStyles)
  const { t } = useTranslation()
  const { edit, activityId } = route.params
  const [dbState, dbDispatch] = useContext(DatabaseContext)
  const [speedData, setSpeedData] = useState<Point[]>()
  const [hrData, setHrData] = useState<Point[]>()

  const [notes, setNotes] = useState<string>('')
  const [editing, setEditing] = useState<boolean>(edit)

  const saveButton = (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: 'green' }]}
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
      <Text style={styles.buttonText}>{t('save')}</Text>
    </TouchableOpacity>
  )

  const discardButton = (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: 'red' }]}
      onPress={() => deleteActivity()}
    >
      <Text style={styles.buttonText}>{t('delete')}</Text>
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
          <MenuOption onSelect={() => deleteActivity()}>
            <Text style={styles.mediumText}>{t('delete')}</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>
    </TouchableOpacity>
  )

  useEffect(() => {
    navigation.setOptions({ headerRight: (props) => menu })

    dbDispatch({ type: 'getActivityData', payload: { activityId: activityId } })
  }, [])

  useEffect(() => {
    if (
      dbState.status === 'success' &&
      dbState.payload.type === 'getActivityData'
    ) {
      const firstTime = dbState.payload.data[0].timestamp
      setSpeedData(
        dbState.payload.data.map((value) => ({
          x: (value.timestamp - firstTime) / 1000,
          y: value.speed!,
        })),
      )
      setHrData(
        dbState.payload.data.map((value) => ({
          x: (value.timestamp - firstTime) / 1000,
          y: value.heart_rate || 0,
        })),
      )
    }
  }, [dbState])

  function deleteActivity() {
    Alert.alert(
      t('deleteActivity'),
      t('deleteActivityNotice'),
      [
        {
          text: t('yes'),
          onPress: () => {
            dbDispatch({
              type: 'deleteActivity',
              payload: { activityId: activityId },
            })
            navigation.goBack()
          },
          style: 'destructive',
        },
        { text: t('cancel'), style: 'cancel' },
      ],
      { cancelable: true },
    )
  }

  return (
    <SafeAreaView
      style={[styles.safeAreaView, { justifyContent: 'flex-start' }]}
    >
      <View style={{ height: 400 }}>
        {speedData ? (
          <LineChart
            style={{ flex: 1 }}
            data={{
              dataSets: [{ label: 'Speed', values: speedData }],
            }}
            marker={{ enabled: false }}
          />
        ) : null}
      </View>
      <View style={{ height: 400 }}>
        {hrData ? (
          <LineChart
            style={{ flex: 1 }}
            data={{
              dataSets: [{ label: 'Heart Rate', values: hrData }],
            }}
            marker={{ enabled: false }}
          />
        ) : null}
      </View>
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
      {editing ? (
        <View>
          {saveButton}
          {discardButton}
        </View>
      ) : null}
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
