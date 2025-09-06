import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LocationData, MapsService } from '../lib/services/MapsService';
import { MAPS_CONFIG } from '../lib/config/maps';

const { width, height } = Dimensions.get('window');

export default function MapTestScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [markers, setMarkers] = useState<Array<{
    id: string;
    coordinate: { latitude: number; longitude: number };
    title: string;
    description: string;
  }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState(MAPS_CONFIG.DEFAULT_REGION);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const currentLocation = await MapsService.getCurrentLocation();
      if (currentLocation) {
        setLocation(currentLocation);
        
        // Centrer la carte sur la position actuelle
        setRegion({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error) {
      setErrorMsg('Erreur lors de la récupération de la localisation');
      console.error('Erreur de localisation:', error);
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const newMarker = {
      id: Date.now().toString(),
      coordinate: { latitude, longitude },
      title: `Marqueur ${markers.length + 1}`,
      description: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
    };
    
    setMarkers([...markers, newMarker]);
  };

  const removeMarker = (markerId: string) => {
    setMarkers(markers.filter(marker => marker.id !== markerId));
  };

  const clearAllMarkers = () => {
    setMarkers([]);
  };

  const centerOnCurrentLocation = () => {
    if (location) {
      mapRef.current?.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const toggleMapType = () => {
    const types: Array<'standard' | 'satellite' | 'hybrid'> = ['standard', 'satellite', 'hybrid'];
    const currentIndex = types.indexOf(mapType);
    const nextType = types[(currentIndex + 1) % types.length];
    setMapType(nextType);
  };

  const addTestMarkers = () => {
    const testPlaces = MapsService.generateTestPlaces(
      MAPS_CONFIG.DEFAULT_REGION.latitude,
      MAPS_CONFIG.DEFAULT_REGION.longitude
    );
    
    const testMarkers = testPlaces.map(place => ({
      id: place.id,
      coordinate: place.coordinate,
      title: place.name,
      description: place.address,
    }));
    
    setMarkers([...markers, ...testMarkers]);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Test Google Maps</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un lieu..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          mapType={mapType}
          region={region}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
        >
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
              onPress={() => {
                Alert.alert(
                  marker.title,
                  marker.description,
                  [
                    { text: 'OK' },
                    { text: 'Supprimer', style: 'destructive', onPress: () => removeMarker(marker.id) }
                  ]
                );
              }}
            />
          ))}
        </MapView>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.controlButton} onPress={centerOnCurrentLocation}>
            <Ionicons name="locate" size={24} color="#E31837" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={toggleMapType}>
            <Ionicons name="layers" size={24} color="#E31837" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Controls Panel */}
      <ScrollView style={styles.controlsPanel} showsVerticalScrollIndicator={false}>
        <View style={styles.controlSection}>
          <Text style={styles.sectionTitle}>Contrôles de la carte</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.actionButton} onPress={addTestMarkers}>
              <Ionicons name="add-circle" size={20} color="#FFF" />
              <Text style={styles.actionButtonText}>Ajouter marqueurs test</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={clearAllMarkers}>
              <Ionicons name="trash" size={20} color="#E31837" />
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Effacer tout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Informations de localisation</Text>
            {errorMsg ? (
              <Text style={styles.errorText}>{errorMsg}</Text>
            ) : location ? (
              <View>
                <Text style={styles.infoText}>
                  Latitude: {location.latitude.toFixed(6)}
                </Text>
                <Text style={styles.infoText}>
                  Longitude: {location.longitude.toFixed(6)}
                </Text>
                <Text style={styles.infoText}>
                  Précision: {location.accuracy?.toFixed(2)}m
                </Text>
              </View>
            ) : (
              <Text style={styles.infoText}>Localisation en cours...</Text>
            )}
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Marqueurs sur la carte</Text>
            <Text style={styles.infoText}>Nombre: {markers.length}</Text>
            <Text style={styles.infoText}>Type de carte: {mapType}</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Instructions</Text>
            <Text style={styles.infoText}>• Appuyez sur la carte pour ajouter un marqueur</Text>
            <Text style={styles.infoText}>• Appuyez sur un marqueur pour le supprimer</Text>
            <Text style={styles.infoText}>• Utilisez les boutons pour contrôler la carte</Text>
            <Text style={styles.infoText}>• Le bouton de localisation centre sur votre position</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  mapContainer: {
    height: height * 0.4,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    right: 10,
    top: 10,
    gap: 8,
  },
  controlButton: {
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  controlsPanel: {
    flex: 1,
    padding: 16,
  },
  controlSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E31837',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E31837',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#E31837',
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#E31837',
  },
});
