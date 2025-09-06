import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MAPS_CONFIG } from '../lib/config/maps';

const { width, height } = Dimensions.get('window');

export default function MapApiTestScreen() {
  const router = useRouter();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    // Test de la clé API après 2 secondes
    const timer = setTimeout(() => {
      if (!mapLoaded) {
        setMapError('La carte ne se charge pas - Vérifiez la clé API');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [mapLoaded]);

  const handleMapReady = () => {
    setMapLoaded(true);
    setMapError(null);
  };

  const handleMapError = (error: any) => {
    console.error('Erreur de carte:', error);
    setMapError('Erreur de chargement de la carte');
  };

  const testApiKey = () => {
    Alert.alert(
      'Test de la clé API',
      `Clé API configurée: ${MAPS_CONFIG.GOOGLE_MAPS_API_KEY.substring(0, 20)}...\n\nStatus: ${mapLoaded ? '✅ Fonctionne' : mapError ? '❌ Erreur' : '⏳ En cours...'}`,
      [{ text: 'OK' }]
    );
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
        <Text style={styles.title}>Test Clé API Google Maps</Text>
        <TouchableOpacity onPress={testApiKey} style={styles.testButton}>
          <Ionicons name="information-circle" size={24} color="#E31837" />
        </TouchableOpacity>
      </View>

      {/* Status */}
      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <Ionicons 
            name={mapLoaded ? "checkmark-circle" : mapError ? "close-circle" : "time"} 
            size={24} 
            color={mapLoaded ? "#4CAF50" : mapError ? "#E31837" : "#FF9800"} 
          />
          <Text style={styles.statusText}>
            {mapLoaded ? 'Carte chargée avec succès' : 
             mapError ? 'Erreur de chargement' : 'Chargement en cours...'}
          </Text>
        </View>
        
        {mapError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{mapError}</Text>
          </View>
        )}
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={MAPS_CONFIG.DEFAULT_REGION}
          onMapReady={handleMapReady}
          onError={handleMapError}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
        />
      </View>

      {/* Info Panel */}
      <ScrollView style={styles.infoPanel} showsVerticalScrollIndicator={false}>
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informations de la clé API</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Clé API:</Text>
            <Text style={styles.infoValue}>
              {MAPS_CONFIG.GOOGLE_MAPS_API_KEY.substring(0, 20)}...
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={[
              styles.infoValue,
              { color: mapLoaded ? '#4CAF50' : mapError ? '#E31837' : '#FF9800' }
            ]}>
              {mapLoaded ? '✅ Fonctionne' : mapError ? '❌ Erreur' : '⏳ Test en cours'}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Région par défaut:</Text>
            <Text style={styles.infoValue}>Conakry, Guinée</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Coordonnées:</Text>
            <Text style={styles.infoValue}>
              {MAPS_CONFIG.DEFAULT_REGION.latitude}, {MAPS_CONFIG.DEFAULT_REGION.longitude}
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Instructions de test</Text>
          <Text style={styles.instructionText}>• La carte devrait se charger automatiquement</Text>
          <Text style={styles.instructionText}>• Si elle se charge, la clé API fonctionne</Text>
          <Text style={styles.instructionText}>• Si elle ne se charge pas, vérifiez la clé API</Text>
          <Text style={styles.instructionText}>• Appuyez sur l'icône d'info pour voir les détails</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Fonctionnalités testées</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color="#4CAF50" />
              <Text style={styles.featureText}>Chargement de la carte</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color="#4CAF50" />
              <Text style={styles.featureText}>Affichage de la région par défaut</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color="#4CAF50" />
              <Text style={styles.featureText}>Bouton de localisation</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color="#4CAF50" />
              <Text style={styles.featureText}>Compass et échelle</Text>
            </View>
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
    flex: 1,
    textAlign: 'center',
  },
  testButton: {
    padding: 4,
  },
  statusContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  errorContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#E31837',
  },
  mapContainer: {
    height: height * 0.35,
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
  infoPanel: {
    flex: 1,
    padding: 16,
  },
  infoSection: {
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
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
  },
});
