import { Theme } from '@react-navigation/native'
import { ReactNode } from 'react'
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
import { useStyles } from '../hooks/styles'

type Item = {
  kind: 'navigation' | 'button' | 'switch'
  title: string
  subTitle?: string
  icon?: ReactNode
  onPress: () => void
  switchValue?: boolean
  disabled?: boolean
  value?: string | number
}

type Settings = {
  title?: string
  data: Item[]
}[]

export function SettingsList(data: Settings) {
  const styles = useStyles(createStyles)

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
            <Text style={[styles.mediumText, styles.title]}>{title}</Text>
          </View>
          {subTitle ? (
            <View style={styles.subTitleView}>
              <Text style={[styles.mediumText, styles.subTitle]}>
                {subTitle}
              </Text>
            </View>
          ) : null}
        </View>
      )
    }

    return (
      <TouchableOpacity
        key={props.title}
        onPress={() => props.onPress()}
        style={[styles.card, styles.touchable]}
        disabled={props.disabled}
      >
        <View style={styles.iconView}>{props.icon}</View>
        <View style={styles.textView}>
          {renderText(props.title, props.subTitle)}
        </View>
        {props.value ? (
          <View style={styles.valueView}>
            <Text style={styles.text}>{props.value}</Text>
          </View>
        ) : null}
        <View>
          {props.kind === 'navigation' ? (
            <Icon
              name={'chevron-right'}
              color={'grey'}
              style={styles.navIcon}
            />
          ) : props.kind === 'switch' ? (
            <Switch value={props.switchValue} onValueChange={props.onPress} />
          ) : null}
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
    },
    subTitleView: {
      padding: 5,
    },
    subTitle: {
      fontSize: 15,
    },
    touchable: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconView: {},
    textView: {
      flexGrow: 1,
    },
    valueView: {
      padding: 5,
    },
    navIcon: {
      padding: 5,
    },
  })
