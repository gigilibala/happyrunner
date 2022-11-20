import { Theme, useTheme } from '@react-navigation/native'
import { ReactNode, useMemo } from 'react'
import {
  SafeAreaView,
  SectionList,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'

type Item = {
  kind: 'navigation' | 'button' | 'switch'
  title: string
  subTitle?: string
  icon?: ReactNode
  onPress: () => void
  switchValue?: boolean
  disabled?: boolean
}

type Settings = {
  title?: string
  data: Item[]
}[]

export function SettingsList(data: Settings) {
  const theme = useTheme()
  const styles = useMemo(() => createStyles(theme), [theme])

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
      <TouchableOpacity
        key={props.title}
        onPress={() => props.onPress()}
        style={styles.touchable}
        disabled={props.disabled}
      >
        <View style={styles.iconView}>{props.icon}</View>
        <View style={styles.textView}>
          {renderText(props.title, props.subTitle)}
        </View>
        <View>
          {props.kind === 'navigation' ? (
            <Icon
              name={'chevron-right'}
              color={'grey'}
              style={styles.navIcon}
            />
          ) : (
            props.kind === 'switch' && (
              <Switch value={props.switchValue} onValueChange={props.onPress} />
            )
          )}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView>
      <SectionList
        sections={data}
        keyExtractor={(item, index) => item.title + index}
        renderItem={({ item }) => renderItem(item)}
        renderSectionHeader={({ section: { title } }) => renderHeader(title)}
      />
    </SafeAreaView>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      fontSize: 17,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    headerView: {
      alignItems: 'center',
      padding: 10,
    },
    titleView: {
      padding: 5,
    },
    title: {
      fontSize: 17,
      color: theme.colors.text,
    },
    subTitleView: {
      padding: 5,
    },
    subTitle: {
      fontSize: 15,
      color: theme.colors.text,
    },
    touchable: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      margin: 5,
    },
    iconView: {},
    textView: {
      flexGrow: 1,
    },
    navIcon: {
      padding: 5,
    },
  })
