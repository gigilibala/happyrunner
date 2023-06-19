import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { Region } from 'react-native-maps'
import { Text } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import MapCard from '../../components/MapCard'
import { useLocation } from '../../hooks/location'

export default function Maps() {
  const [location, locationDispatch] = useLocation()
  const [region, setRegion] = useState<Region>({
    latitude: location.position?.coords.latitude || 37.3751783,
    longitude: location.position?.coords.longitude || -122.0153167,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  })

  useEffect(() => {
    locationDispatch({ type: 'start' })
  }, [])

  useEffect(() => {
    console.log('location changed to: ', JSON.stringify(region))
    setRegion((prev) => {
      const newRegion = { ...prev }
      if (location.position?.coords.latitude) {
        newRegion.latitude = location.position.coords.latitude
      }
      if (location.position?.coords.longitude) {
        newRegion.longitude = location.position.coords.longitude
      }

      return newRegion
    })
  }, [location.position])

  return (
    <SafeAreaView>
      <MapCard region={region} />
      <View style={{ margin: 10 }}>
        <Text>{JSON.stringify(location.position, null, 2)}</Text>
      </View>
    </SafeAreaView>
  )
}
