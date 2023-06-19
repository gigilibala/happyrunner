import React, { useEffect, useState } from 'react'
import { Platform, View } from 'react-native'
import MapView, {
  Animated,
  AnimatedRegion,
  Region,
  UrlTile,
} from 'react-native-maps'

type MapCardProps = {
  region: Region
}

export default function MapCard(props: MapCardProps) {
  const [region, setRegion] = useState<Region>(
    new AnimatedRegion({ ...props.region }),
  )

  let _mapView: MapView | null

  useEffect(() => {
    // TODO: Fix the animated camera to follow the location. This doesn't work yet.
    _mapView?.animateCamera(
      {
        center: {
          latitude: props.region.latitude,
          longitude: props.region.longitude,
        },
      },
      { duration: 500 },
    )
  }, [props.region])

  return (
    <View>
      <Animated
        ref={(mapView: any) => {
          _mapView = mapView
        }}
        style={{
          minHeight: '60%',
        }}
        region={region}
        onRegionChange={(region, details) => setRegion(region)}
        onMapLoaded={() => console.log('maps loaded')}
        onMapReady={() => console.log('maps ready')}
        mapType={Platform.OS === 'android' ? 'none' : 'standard'}
        showsCompass
        rotateEnabled
        zoomEnabled
        loadingEnabled
        showsUserLocation
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
