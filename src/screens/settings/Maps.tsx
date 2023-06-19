import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { Text } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import MapCard from '../../components/MapCard'
import { useLocation } from '../../hooks/location'

export default function Maps() {
  const [location, locationDispatch] = useLocation()
  const [latitude, setLatitude] = useState<number>(0)
  const [longitude, setLongitude] = useState<number>(0)

  useEffect(() => {
    locationDispatch({ type: 'start' })
  }, [])

  useEffect(() => {
    if (location.position) {
      setLatitude(location.position.coords.latitude)
      setLongitude(location.position.coords.longitude)
    }
  }, [location.position])

  return (
    <SafeAreaView>
      <MapCard latitude={latitude} longitude={longitude} />
      <View style={{ margin: 10 }}>
        <Text>{JSON.stringify(location.position, null, 2)}</Text>
      </View>
    </SafeAreaView>
  )
}
