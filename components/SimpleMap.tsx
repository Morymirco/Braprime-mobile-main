import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface SimpleMapProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  height?: number;
}

export default function SimpleMap({ 
  latitude = 9.5370, 
  longitude = -13.6785, 
  onLocationSelect,
  height = 300
}: SimpleMapProps) {
  const [selectedLocation, setSelectedLocation] = useState({
    latitude,
    longitude
  });

  const handleMapPress = (event: any) => {
    const { latitude: lat, longitude: lng } = event.nativeEvent.coordinate;
    
    console.log('🗺️ Map pressed at:', { lat, lng });
    
    setSelectedLocation({ latitude: lat, longitude: lng });
    
    if (onLocationSelect) {
      onLocationSelect(lat, lng);
    }
  };

  const handleMarkerDrag = (event: any) => {
    const { latitude: lat, longitude: lng } = event.nativeEvent.coordinate;
    
    console.log('🎯 Marker dragged to:', { lat, lng });
    
    setSelectedLocation({ latitude: lat, longitude: lng });
    
    if (onLocationSelect) {
      onLocationSelect(lat, lng);
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        showsBuildings={true}
        showsTraffic={false}
        showsIndoors={true}
        mapType="standard"
      >
        <Marker
          coordinate={selectedLocation}
          draggable={true}
          onDragEnd={handleMarkerDrag}
          title="Emplacement sélectionné"
          description={`Lat: ${selectedLocation.latitude.toFixed(6)}, Lng: ${selectedLocation.longitude.toFixed(6)}`}
        >
          <MaterialIcons name="location-on" size={30} color="#E31837" />
        </Marker>
      </MapView>
      
      <View style={styles.instructions}>
        <MaterialIcons name="info" size={16} color="#666" />
        <Text style={styles.instructionsText}>
          Cliquez sur la carte ou faites glisser le marqueur pour sélectionner un emplacement
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  instructionsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
}); 