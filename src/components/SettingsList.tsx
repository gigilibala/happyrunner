import { ReactNode } from 'react'
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
  SectionList,
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'

type Item = {
  kind: 'navigation' | 'button' | 'switch'
  title: string
  subTitle?: string
  icon?: ReactNode
  onPress: () => void
  switchValue?: boolean
}

type Settings = {
  title?: string
  data: Item[]
}[]

export function SettingsList(data: Settings) {
  function renderHeader(title?: string) {
    return title ? (
      <View style={styles.headerView}>
        <Text style={styles.header}>{title.toUpperCase()}</Text>
      </View>
    ) : null
  }

  function renderItem(props: Item) {
    function renderText(title: string, subTitle?: string) {
      return (
        <View>
          <View style={styles.titleView}>
            <Text style={styles.title}>{title}</Text>
          </View>
          {subTitle && (
            <View style={styles.subTitleView}>
              <Text style={styles.subTitle}>{subTitle}</Text>
            </View>
          )}
        </View>
      )
    }

    return (
      <TouchableOpacity key={props.title} onPress={() => props.onPress()}>
        <View style={styles.touchable}>
          <View style={styles.iconView}>{props.icon}</View>
          <View style={styles.textView}>
            {renderText(props.title, props.subTitle)}
            {props.kind === 'navigation' ? (
              <Icon name="chevron-right" color="grey" style={styles.navIcon} />
            ) : (
              props.kind === 'switch' && (
                <Switch
                  value={props.switchValue}
                  onValueChange={props.onPress}
                />
              )
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  function renderSeparator() {
    return <View style={styles.spacing} />
  }

  return (
    <SafeAreaView>
      <SectionList
        sections={data}
        keyExtractor={(item, index) => item.title + index}
        renderItem={({ item }) => renderItem(item)}
        renderSectionHeader={({ section: { title } }) => renderHeader(title)}
        ItemSeparatorComponent={() => renderSeparator()}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    fontSize: 17,
  },
  headerView: {
    alignItems: 'center',
  },
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
  },
  touchable: {
    flex: 1,
    flexDirection: 'row',
  },
  iconView: { justifyContent: 'center' },
  textView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spacing: {
    height: 1,
    backgroundColor: 'grey',
  },
  navIcon: {
    padding: 5,
  },
})
