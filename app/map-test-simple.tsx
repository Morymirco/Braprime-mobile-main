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

export default function MapTestSimpleScreen() {
  const router = useRouter();
  
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const currentLocation = await MapsService.getCurrentLocation();
      if (currentLocation) {
        setLocation(currentLocation);
        setErrorMsg(null);
      }
    } catch (error) {
      setErrorMsg('Erreur lors de la récupération de la localisation');
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

  const handleLocationSelect = async (selectedLocation: LocationData) => {
    try {
      const address = await MapsService.reverseGeocode(
        selectedLocation.latitude,
        selectedLocation.longitude
      );
      
      Alert.alert(
        'Localisation sélectionnée',
        `Adresse: ${address}\nCoordonnées: ${MapsService.formatCoordinates(selectedLocation.latitude, selectedLocation.longitude)}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erreur de géocodage inverse:', error);
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
        <Text style={styles.title}>Test de Géolocalisation</Text>
        <View style={styles.placeholder} />
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
          <Text style={styles.sectionTitle}>Position actuelle</Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Récupération de la localisation...</Text>
            </View>
          ) : errorMsg ? (
            <View style={styles.errorContainer}>
              <Ionicons name="warning" size={24} color="#E31837" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : location ? (
            <View style={styles.locationContainer}>
              <View style={styles.locationHeader}>
                <Ionicons name="location" size={20} color="#4CAF50" />
                <Text style={styles.locationTitle}>Position détectée</Text>
              </View>
              <Text style={styles.coordinateText}>
                {MapsService.formatCoordinates(location.latitude, location.longitude)}
              </Text>
              {location.accuracy && (
                <Text style={styles.accuracyText}>
                  Précision: {location.accuracy.toFixed(2)}m
                </Text>
              )}
            </View>
          ) : (
            <Text style={styles.infoText}>Aucune localisation disponible</Text>
          )}
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Résultats de recherche</Text>
            {searchResults.map((result, index) => (
              <TouchableOpacity
                key={index}
                style={styles.resultItem}
                onPress={() => handleLocationSelect(result)}
              >
                <View style={styles.resultIcon}>
                  <Ionicons name="location" size={20} color="#E31837" />
                </View>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultText}>
                    {MapsService.formatCoordinates(result.latitude, result.longitude)}
                  </Text>
                  <Text style={styles.resultSubtext}>
                    Résultat {index + 1}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Test Functions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fonctions de test</Text>
          
          <TouchableOpacity style={styles.testButton} onPress={getCurrentLocation}>
            <Ionicons name="locate" size={20} color="#FFF" />
            <Text style={styles.testButtonText}>Actualiser la position</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, styles.secondaryButton]} 
            onPress={() => {
              const testPlaces = MapsService.generateTestPlaces(
                location?.latitude || 9.6412,
                location?.longitude || -13.5784
              );
              Alert.alert(
                'Lieux de test générés',
                `${testPlaces.length} lieux de test créés autour de votre position`,
                [{ text: 'OK' }]
              );
            }}
          >
            <Ionicons name="business" size={20} color="#E31837" />
            <Text style={[styles.testButtonText, styles.secondaryButtonText]}>
              Générer lieux de test
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instructionText}>• Appuyez sur "Actualiser la position" pour obtenir votre localisation</Text>
          <Text style={styles.instructionText}>• Tapez une adresse dans la barre de recherche</Text>
          <Text style={styles.instructionText}>• Appuyez sur un résultat pour voir les détails</Text>
          <Text style={styles.instructionText}>• Utilisez "Générer lieux de test" pour créer des données de test</Text>
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
  locationContainer: {
    padding: 16,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  coordinateText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  accuracyText: {
    fontSize: 12,
    color: '#666',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  resultSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E31837',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E31837',
  },
  testButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#E31837',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});
