import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { LocationData, MapsService } from '../lib/services/MapsService';

const { width, height } = Dimensions.get('window');

export default function LocationPickerSimpleScreen() {
  const router = useRouter();
  
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const location = await MapsService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        
        // Obtenir l'adresse de la position actuelle
        try {
          const address = await MapsService.reverseGeocode(location.latitude, location.longitude);
          setCurrentLocation({ ...location, address });
        } catch (error) {
          console.error('Erreur de géocodage inverse:', error);
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'obtenir votre position actuelle');
      console.error('Erreur de localisation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsLoading(true);
      const results = await MapsService.geocode(searchQuery);
      setSearchResults(results);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de trouver cette adresse');
      console.error('Erreur de recherche:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = async (location: LocationData) => {
    try {
      let address = location.address;
      if (!address) {
        address = await MapsService.reverseGeocode(location.latitude, location.longitude);
      }
      
      setSelectedLocation({ ...location, address });
    } catch (error) {
      console.error('Erreur de géocodage inverse:', error);
      setSelectedLocation(location);
    }
  };

  const confirmSelection = () => {
    if (selectedLocation) {
      Alert.alert(
        'Localisation sélectionnée',
        `Adresse: ${selectedLocation.address || 'Non disponible'}\nCoordonnées: ${MapsService.formatCoordinates(selectedLocation.latitude, selectedLocation.longitude)}`,
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Confirmer', 
            onPress: () => {
              // Ici vous pouvez passer les données à la page précédente
              router.back();
            }
          }
        ]
      );
    } else {
      Alert.alert('Erreur', 'Veuillez sélectionner une localisation');
    }
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
        <Text style={styles.title}>Sélecteur de localisation</Text>
        <TouchableOpacity onPress={confirmSelection} style={styles.confirmButton}>
          <Text style={styles.confirmText}>Confirmer</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une adresse..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={handleSearch}
          disabled={isLoading}
        >
          <Ionicons name="search" size={20} color="#E31837" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ma position actuelle</Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Récupération de la localisation...</Text>
            </View>
          ) : currentLocation ? (
            <TouchableOpacity
              style={[
                styles.locationItem,
                selectedLocation === currentLocation && styles.selectedLocationItem
              ]}
              onPress={() => handleLocationSelect(currentLocation)}
            >
              <View style={styles.locationIcon}>
                <Ionicons name="locate" size={20} color="#4CAF50" />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationTitle}>Position actuelle</Text>
                <Text style={styles.locationAddress}>
                  {currentLocation.address || 'Adresse en cours de récupération...'}
                </Text>
                <Text style={styles.coordinateText}>
                  {MapsService.formatCoordinates(currentLocation.latitude, currentLocation.longitude)}
                </Text>
              </View>
              {selectedLocation === currentLocation && (
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.errorContainer}>
              <Ionicons name="warning" size={24} color="#E31837" />
              <Text style={styles.errorText}>Impossible d'obtenir votre position</Text>
            </View>
          )}
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Résultats de recherche</Text>
            {searchResults.map((result, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.locationItem,
                  selectedLocation === result && styles.selectedLocationItem
                ]}
                onPress={() => handleLocationSelect(result)}
              >
                <View style={styles.locationIcon}>
                  <Ionicons name="location" size={20} color="#E31837" />
                </View>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationTitle}>Résultat {index + 1}</Text>
                  <Text style={styles.coordinateText}>
                    {MapsService.formatCoordinates(result.latitude, result.longitude)}
                  </Text>
                </View>
                {selectedLocation === result && (
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Selected Location */}
        {selectedLocation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Localisation sélectionnée</Text>
            <View style={styles.selectedContainer}>
              <View style={styles.selectedHeader}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.selectedTitle}>Sélection confirmée</Text>
              </View>
              <Text style={styles.selectedAddress}>
                {selectedLocation.address || 'Adresse non disponible'}
              </Text>
              <Text style={styles.selectedCoordinates}>
                {MapsService.formatCoordinates(selectedLocation.latitude, selectedLocation.longitude)}
              </Text>
            </View>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instructionText}>• Votre position actuelle est automatiquement détectée</Text>
          <Text style={styles.instructionText}>• Tapez une adresse dans la barre de recherche</Text>
          <Text style={styles.instructionText}>• Appuyez sur une localisation pour la sélectionner</Text>
          <Text style={styles.instructionText}>• Appuyez sur "Confirmer" pour valider votre choix</Text>
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
    flex: 1,
    textAlign: 'center',
  },
  confirmButton: {
    padding: 8,
  },
  confirmText: {
    color: '#E31837',
    fontSize: 16,
    fontWeight: '600',
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
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#E31837',
    flex: 1,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedLocationItem: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  coordinateText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  selectedContainer: {
    padding: 16,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedAddress: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  selectedCoordinates: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});
