import { Theme } from '@react-navigation/native'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useStyles } from '../common/styles'
import useActivity from '../hooks/Activity'
import { Props } from './navigators/RootNavigator'

export default function Home({ route, navigation }: Props<'Home'>) {
  const styles = useStyles(createStyles)
  const { status, setStatus, start, position } = useActivity()

  const bigButtonSize = 80
  const smallButtonSize = 60

  const bigStartButton = (
    <TouchableOpacity
      onPress={() => {
        start()
      }}
    >
      <Icon name={'play-circle'} size={bigButtonSize} color={'red'} />
    </TouchableOpacity>
  )

  const smallStartButton = (
    <TouchableOpacity
      onPress={() => {
        setStatus('in-progress')
      }}
    >
      <Icon name={'play-circle'} size={smallButtonSize} color={'red'} />
    </TouchableOpacity>
  )

  const pauseButton = (
    <TouchableOpacity
      onPress={() => {
        setStatus('paused')
      }}
    >
      <Icon name={'pause-circle'} size={smallButtonSize} color={'orange'} />
    </TouchableOpacity>
  )

  const stopButton = (
    <TouchableOpacity
      onPress={() => {
        setStatus('stopped')
      }}
    >
      <Icon name={'stop-circle'} size={smallButtonSize} color={'brown'} />
    </TouchableOpacity>
  )

  function renderButtons(): ReactNode {
    switch (status) {
      case 'in-progress':
        return (
          <View style={styles.rowButtonView}>
            <View>{pauseButton}</View>
            <View>{stopButton}</View>
          </View>
        )
      case 'paused':
        return (
          <View style={styles.rowButtonView}>
            <View>{smallStartButton}</View>
            <View>{stopButton}</View>
          </View>
        )
      case undefined:
      case 'stopped':
        return bigStartButton
    }
  }
  const { t, i18n } = useTranslation()
  return (
    <SafeAreaView style={[styles.safeAreaView]}>
      <View style={[styles.button, styles.testButtonView]}>
        <Button
          title={t('test')}
          onPress={() => {
            i18n.language === 'en'
              ? i18n.changeLanguage('it')
              : i18n.changeLanguage('en')
          }}
        />
      </View>
      <View>
        <Text style={styles.text}>
          {position?.coords.latitude}...{position?.coords.longitude}
        </Text>
      </View>
      <View style={styles.buttonsView}>{renderButtons()}</View>
    </SafeAreaView>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    testButtonView: {
      flex: 3,
    },
    rowButtonView: {
      flexDirection: 'row',
      alignContent: 'space-between',
    },
    buttonsView: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      alignSelf: 'auto',
    },
  })
