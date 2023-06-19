import React, { useEffect, useRef } from 'react'
import { View } from 'react-native'
import MapView, { Animated, UrlTile } from 'react-native-maps'

type MapCardProps = {
  latitude: number
  longitude: number
}

export default function MapCard({ latitude, longitude }: MapCardProps) {
  const _mapView = useRef<MapView>()

  useEffect(() => {
    _mapView.current?.animateToRegion({
      latitude: latitude,
      longitude: longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
  }, [latitude, longitude])

  return (
    <View>
      <Animated
        ref={_mapView}
        style={{
          minHeight: '60%',
        }}
        onMapLoaded={() => console.log('maps loaded')}
        onMapReady={() => console.log('maps ready')}
        mapType={'standard'}
        showsCompass
        rotateEnabled
        zoomEnabled
        loadingEnabled
        showsUserLocation // Use a marker instead of native user location.
      >
        <UrlTile
          urlTemplate='https://tile.openstreetmap.de/{z}/{x}/{y}.png'
          shouldReplaceMapContent={true}
          maximumZ={20}
          flipY={false}
        />
      </Animated>
    </View>
  )
}
