import { NativeStackScreenProps } from '@react-navigation/native-stack'
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { commonStyles } from '../common/constants'
import { SettingsStackParams } from '../components/navigators/SettingsStack'

type Props = NativeStackScreenProps<SettingsStackParams, 'Settings'>

type SettingType = {
  title: string
  subTitle?: string
  navigate?: () => void
}

export function Settings({ navigation }: Props) {
  const settingsItems: SettingType[] = [
    {
      title: 'Heart Rate Monitor',
      navigate: () => {
        navigation.navigate('Heart Rate Monitor')
      },
    },
    { title: 'Dummy one', subTitle: 'hello' },
  ]

  return (
    <SafeAreaView>
      <ScrollView>
        {settingsItems.map(({ title, subTitle, navigate }) => {
          return (
            <TouchableOpacity
              key={title}
              onPress={() => {
                navigate?.()
              }}
            >
              <View style={styles.titleView}>
                <Text style={styles.title}>{title}</Text>
                {subTitle && (
                  <View style={styles.subTitleView}>
                    <Text style={styles.subTitle}>{subTitle}</Text>
                  </View>
                )}
              </View>
              <View style={commonStyles.spacing} />
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  titleView: {
    padding: 10,
  },
  title: {
    fontSize: 17,
  },
  subTitleView: {
    padding: 10,
  },
  subTitle: {
    fontSize: 15,
    opacity: 0.6,
  },
})
