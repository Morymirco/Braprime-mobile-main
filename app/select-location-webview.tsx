import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapWebView from '../components/MapWebView';
import ToastContainer from '../components/ToastContainer';
import { useToast } from '../hooks/useToast';
import { locationService, type Place } from '../lib/services/LocationService';

const { width, height } = Dimensions.get('window');

interface LocationParams {
  onSelect?: (location: {
    address: string;
    latitude: number;
    longitude: number;
    neighborhood: string;
    landmark?: string;
  }) => void;
}

export default function SelectLocationWebViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<LocationParams>();
  const { showToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    latitude: number;
    longitude: number;
    neighborhood: string;
    landmark?: string;
  } | null>(null);
  const [landmark, setLandmark] = useState('');
  const [mapCoordinates, setMapCoordinates] = useState({
    latitude: 9.5370,
    longitude: -13.6785
  });
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Utiliser le service LocationService pour la recherche
  const searchPlaces = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const places = await locationService.searchPlaces(query);
      setSearchResults(places);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      showToast('error', 'Erreur lors de la recherche d\'adresses');
    } finally {
      setIsSearching(false);
    }
  };

  // Recherche avec debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(searchQuery);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handlePlaceSelect = (place: Place) => {
    // Extraire le quartier de l'adresse
    const addressParts = place.address.split(',');
    const neighborhood = addressParts[0].trim();
    
    const location = {
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      neighborhood,
      landmark: landmark
    };

    setSelectedLocation(location);
    setMapCoordinates({
      latitude: place.latitude,
      longitude: place.longitude
    });
    setSearchQuery(place.name);
    setSearchResults([]);

    showToast('success', 'Emplacement sélectionné');
  };

  const handleMapLocationSelect = async (latitude: number, longitude: number) => {
    try {
      // Utiliser le service pour le géocodage inverse
      const location = await locationService.reverseGeocode(latitude, longitude);
      
      if (location) {
        const finalLocation = {
          ...location,
          landmark: landmark
        };

        setSelectedLocation(finalLocation);
        showToast('success', 'Emplacement sélectionné sur la carte');
      } else {
        // Si le géocodage échoue, créer une location manuelle
        const manualLocation = {
          address: `Adresse sélectionnée (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          latitude,
          longitude,
          neighborhood: 'Quartier sélectionné',
          landmark: landmark
        };
        setSelectedLocation(manualLocation);
        showToast('success', 'Emplacement sélectionné sur la carte');
      }
    } catch (error) {
      console.error('Erreur lors du géocodage inverse:', error);
      // Créer une location manuelle en cas d'erreur
      const manualLocation = {
        address: `Adresse sélectionnée (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        latitude,
        longitude,
        neighborhood: 'Quartier sélectionné',
        landmark: landmark
      };
      setSelectedLocation(manualLocation);
      showToast('success', 'Emplacement sélectionné sur la carte');
    }
  };

  const handleConfirmLocation = () => {
    if (!selectedLocation) {
      showToast('error', 'Veuillez sélectionner un emplacement');
      return;
    }

    if (!landmark.trim()) {
      Alert.alert(
        'Point de repère',
        'Voulez-vous ajouter un point de repère pour faciliter la livraison ?',
        [
          {
            text: 'Non, continuer',
            onPress: () => confirmAndReturn()
          },
          {
            text: 'Oui, ajouter',
            style: 'cancel'
          }
        ]
      );
      return;
    }

    confirmAndReturn();
  };

  const confirmAndReturn = () => {
    if (selectedLocation) {
      const finalLocation = {
        ...selectedLocation,
        landmark: landmark.trim() || undefined
      };

      // Retourner à la page précédente avec l'emplacement sélectionné
      router.back();
      
      // Simuler le callback (dans une vraie app, vous utiliseriez un contexte ou une navigation avec params)
      if (params.onSelect) {
        params.onSelect(finalLocation);
      }
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const renderSearchResult = ({ item }: { item: Place }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => handlePlaceSelect(item)}
    >
      <View style={styles.searchResultIcon}>
        <MaterialIcons name="location-on" size={20} color="#E31837" />
      </View>
      <View style={styles.searchResultContent}>
        <Text style={styles.searchResultName}>{item.name}</Text>
        <Text style={styles.searchResultAddress}>{item.address}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ToastContainer />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sélectionner l'adresse</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une adresse..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {isSearching && (
            <ActivityIndicator size="small" color="#E31837" style={styles.searchLoading} />
          )}
        </View>
      </View>

      {/* Résultats de recherche */}
      {searchResults.length > 0 && (
        <View style={styles.searchResultsContainer}>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id}
            style={styles.searchResultsList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Carte interactive avec WebView */}
      <View style={styles.mapContainer}>
        <MapWebView
          latitude={mapCoordinates.latitude}
          longitude={mapCoordinates.longitude}
          onLocationSelect={handleMapLocationSelect}
          height={300}
        />
        <View style={styles.mapInstructions}>
          <MaterialIcons name="info" size={16} color="#666" />
          <Text style={styles.mapInstructionsText}>
            Cliquez sur la carte ou faites glisser le marqueur pour sélectionner un emplacement
          </Text>
        </View>
      </View>

      {/* Informations de l'emplacement sélectionné */}
      {selectedLocation && (
        <View style={styles.locationInfoContainer}>
          <View style={styles.locationInfoHeader}>
            <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.locationInfoTitle}>Emplacement sélectionné</Text>
          </View>
          
          <Text style={styles.locationAddress}>{selectedLocation.address}</Text>
          <Text style={styles.locationNeighborhood}>Quartier: {selectedLocation.neighborhood}</Text>
          
          <View style={styles.landmarkContainer}>
            <Text style={styles.landmarkLabel}>Point de repère (optionnel)</Text>
            <TextInput
              style={styles.landmarkInput}
              placeholder="Ex: Près de la station Total, bâtiment rouge..."
              value={landmark}
              onChangeText={setLandmark}
              multiline
            />
          </View>
        </View>
      )}

      {/* Bouton de confirmation */}
      <View style={styles.confirmContainer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            !selectedLocation && styles.confirmButtonDisabled
          ]}
          onPress={handleConfirmLocation}
          disabled={!selectedLocation}
        >
          <MaterialIcons name="check" size={20} color="#FFF" />
          <Text style={styles.confirmButtonText}>
            Confirmer cette adresse
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 32,
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  searchLoading: {
    marginLeft: 8,
  },
  searchResultsContainer: {
    backgroundColor: '#fff',
    maxHeight: 200,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResultsList: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultIcon: {
    marginRight: 12,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  searchResultAddress: {
    fontSize: 14,
    color: '#666',
  },
  mapContainer: {
    backgroundColor: '#fff',
  },
  mapInstructions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  mapInstructionsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  locationInfoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  locationInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  locationAddress: {
    fontSize: 14,
    color: '#000',
    marginBottom: 4,
  },
  locationNeighborhood: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  landmarkContainer: {
    marginTop: 8,
  },
  landmarkLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  landmarkInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    minHeight: 40,
  },
  confirmContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  confirmButton: {
    backgroundColor: '#E31837',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
}); 