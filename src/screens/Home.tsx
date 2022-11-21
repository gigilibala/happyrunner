import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/FontAwesome5'
import useActivity from '../hooks/Activity'
import { Props } from './navigators/HomeStack'

export default function Home({ route, navigation }: Props<'Home Screen'>) {
  const { status, setStatus, start } = useActivity()

  const bigButtonSize = 80
  const smallButtonSize = 60

  const bigStartButton = (
    <TouchableOpacity
      onPress={() => {
        start()
      }}
    >
      <Icon
        name="play-circle"
        size={bigButtonSize}
        color="red"
        style={styles.button}
      />
    </TouchableOpacity>
  )

  const smallStartButton = (
    <TouchableOpacity
      onPress={() => {
        setStatus('in-progress')
      }}
    >
      <Icon
        name={'play-circle'}
        size={smallButtonSize}
        color={'red'}
        style={styles.button}
      />
    </TouchableOpacity>
  )

  const pauseButton = (
    <TouchableOpacity
      onPress={() => {
        setStatus('paused')
      }}
    >
      <Icon
        name={'pause-circle'}
        size={smallButtonSize}
        color={'orange'}
        style={styles.button}
      />
    </TouchableOpacity>
  )

  const stopButton = (
    <TouchableOpacity
      onPress={() => {
        setStatus('stopped')
      }}
    >
      <Icon
        name={'stop-circle'}
        size={smallButtonSize}
        color={'brown'}
        style={styles.button}
      />
    </TouchableOpacity>
  )

  function renderButtons(): ReactNode {
    switch (status) {
      case 'in-progress':
        return (
          <View style={styles.rowButton}>
            <View>{pauseButton}</View>
            <View>{stopButton}</View>
          </View>
        )
      case 'paused':
        return (
          <View style={styles.rowButton}>
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
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 3 }}>
        <Button
          title={t('test')}
          onPress={() => {
            i18n.language === 'en'
              ? i18n.changeLanguage('it')
              : i18n.changeLanguage('en')
          }}
        />
      </View>
      <View style={styles.buttonsView}>{renderButtons()}</View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  rowButton: {
    flexDirection: 'row',
    alignContent: 'space-between',
  },
  buttonsView: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  button: {
    // padding: 30,
  },
})
