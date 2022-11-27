import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Props } from '../RootNavigator'

export default function ActivityDetails({
  route,
  navigation,
}: Props<'Activity Details'>) {
  const { activityId } = route.params
  return (
    <View>
      <Text>ActivityDetails</Text>
    </View>
  )
}

const styles = StyleSheet.create({})
