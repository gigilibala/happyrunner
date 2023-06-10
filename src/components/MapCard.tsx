import React, { useState } from 'react'
import { Platform, View } from 'react-native'
import MapView, { Region, UrlTile } from 'react-native-maps'

export default function MapCard() {
  const [region, setRegion] = useState<Region>({
    latitude: 35.468404,
    longitude: 50.984149,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  })

  return (
    <View>
      <MapView
        style={{
          minHeight: '60%',
        }}
        initialRegion={region}
        onRegionChange={(region) => setRegion(region)}
        onMapLoaded={() => console.log('loaded')}
        onMapReady={() => console.log('ready')}
        mapType={Platform.OS === 'android' ? 'none' : 'standard'}
        rotateEnabled={true}
        zoomEnabled={true}
      >
        <UrlTile
          urlTemplate='https://tile.openstreetmap.de/{z}/{x}/{y}.png'
          shouldReplaceMapContent={true}
          maximumZ={20}
          flipY={false}
        />
      </MapView>
    </View>
  )
}
