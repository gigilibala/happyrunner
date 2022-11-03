import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useContext } from 'react'
import { Button } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { HomeStackParams } from '../components/navigators/HomeStack'
import { DatabaseContext } from '../hooks/DatabaseProvider'

type Props = NativeStackScreenProps<HomeStackParams, 'Home Screen'>

export default function Home({ route, navigation }: Props) {
  const { startActivity } = useContext(DatabaseContext)
  return (
    <SafeAreaView>
      <Button
        title="Start"
        onPress={() => {
          startActivity()
        }}
      />
    </SafeAreaView>
  )
}
