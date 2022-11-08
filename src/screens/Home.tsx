import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React from 'react'
import { Button } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { HomeStackParams } from '../components/navigators/HomeStack'
import useActivity from '../hooks/Activity'

type Props = NativeStackScreenProps<HomeStackParams, 'Home Screen'>

export default function Home({ route, navigation }: Props) {
  const { start, pause, stop } = useActivity()
  return (
    <SafeAreaView>
      <Button
        title="Start"
        onPress={() => {
          start()
        }}
      />
      <Button
        title="Pause"
        onPress={() => {
          console.log('pause')
          pause()
        }}
      />
      <Button
        title="Stop"
        onPress={() => {
          console.log('stop')
          stop()
        }}
      />
    </SafeAreaView>
  )
}
