import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { commonStyles } from '../common/constants'

export type SettingType = {
  title: string
  subTitle?: string
  navigate?: () => void
}

export function Settings(items: SettingType[]) {
  return (
    <SafeAreaView>
      <ScrollView>
        {items.map(({ title, subTitle, navigate }) => {
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
