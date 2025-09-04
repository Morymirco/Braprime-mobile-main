import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import { searchCommuneQuartierByAddress } from '../lib/data/conakry-locations';
import SimpleAddressInput from './SimpleAddressInput';
// Import conditionnel pour éviter les erreurs si la bibliothèque n'est pas installée
let GooglePlacesAutocomplete: any = null;
try {
  GooglePlacesAutocomplete = require('react-native-google-places-autocomplete').default;
} catch (error) {
  console.log('⚠️ react-native-google-places-autocomplete non disponible:', error);
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  onPlaceSelect?: (place: any) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  showMap?: boolean;
}

interface PlaceDetails {
  place_id: string;
  formatted_address: string;
  name?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Rechercher une adresse, quartier, lieu ou établissement...",
  label = "Adresse",
  required = false,
  showMap = true,
}: AddressAutocompleteProps) {
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);

  // Vérifier si la clé API Google Places est configurée et si le composant est disponible
  const hasGooglePlacesKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY && 
    process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY !== '';
  const hasGooglePlacesComponent = GooglePlacesAutocomplete !== null;

  // Si pas de clé API ou pas de composant, utiliser le composant SimpleAddressInput
  if (!hasGooglePlacesKey || !hasGooglePlacesComponent) {
    return (
      <SimpleAddressInput
        value={value}
        onChange={onChange}
        onPlaceSelect={onPlaceSelect}
        placeholder={placeholder}
        label={label}
        required={required}
        showMap={showMap}
      />
    );
  }

  // Fonction pour extraire le quartier depuis Google Places
  const extractNeighborhoodFromGooglePlace = (place: PlaceDetails): string => {
    console.log('🔍 Extraction du quartier depuis Google Places:', place);
    
    if (!place.address_components) {
      console.log('❌ Pas de composants d\'adresse disponibles');
      return '';
    }
    
    // Log tous les composants d'adresse pour debug
    console.log('📍 Composants d\'adresse Google Places:');
    place.address_components.forEach((component, index) => {
      console.log(`  ${index}: ${component.types.join(', ')} = "${component.long_name}"`);
    });
    
    // 1. Chercher le composant "sublocality_level_1" (quartier principal)
    const neighborhood = place.address_components.find((component) => 
      component.types.includes('sublocality_level_1')
    );
    
    if (neighborhood) {
      console.log('✅ Quartier trouvé (sublocality_level_1):', neighborhood.long_name);
      return neighborhood.long_name;
    }
    
    // 2. Fallback: chercher "sublocality" (sous-localité)
    const sublocality = place.address_components.find((component) => 
      component.types.includes('sublocality')
    );
    
    if (sublocality) {
      console.log('✅ Sous-localité trouvée (sublocality):', sublocality.long_name);
      return sublocality.long_name;
    }
    
    // 3. Fallback: chercher "locality" (localité)
    const locality = place.address_components.find((component) => 
      component.types.includes('locality')
    );
    
    if (locality) {
      console.log('✅ Localité trouvée (locality):', locality.long_name);
      return locality.long_name;
    }
    
    // 4. Fallback: chercher "administrative_area_level_2" (département/région)
    const adminArea2 = place.address_components.find((component) => 
      component.types.includes('administrative_area_level_2')
    );
    
    if (adminArea2) {
      console.log('✅ Zone administrative trouvée (admin_area_level_2):', adminArea2.long_name);
      return adminArea2.long_name;
    }
    
    // 5. Fallback: chercher "route" (nom de rue) si c'est une rue spécifique
    const route = place.address_components.find((component) => 
      component.types.includes('route')
    );
    
    if (route) {
      console.log('✅ Route trouvée (route):', route.long_name);
      return route.long_name;
    }
    
    console.log('❌ Aucun composant de quartier trouvé dans Google Places');
    return '';
  };

  // Gérer la sélection d'un lieu
  const handlePlaceSelect = (data: any, details: PlaceDetails | null) => {
    if (details) {
      setSelectedPlace(details);
      onChange(details.formatted_address);
      
      // Extraire le quartier et la commune
      const neighborhood = extractNeighborhoodFromGooglePlace(details);
      const locationInfo = searchCommuneQuartierByAddress(details.formatted_address);
      
      console.log('📍 Informations de localisation extraites:', {
        neighborhood,
        locationInfo,
        fullAddress: details.formatted_address
      });
      
      // Appeler le callback si fourni
      if (onPlaceSelect) {
        onPlaceSelect({
          ...details,
          extracted_neighborhood: neighborhood,
          commune: locationInfo.commune,
          quartier: locationInfo.quartier
        });
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, required && !value && styles.requiredLabel]}>
        {label} {required && '*'}
      </Text>
      
      <GooglePlacesAutocomplete
        placeholder={placeholder}
        onPress={handlePlaceSelect}
        query={{
          key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '',
          language: 'fr',
          components: 'country:gn', // Restreindre à la Guinée
        }}
        fetchDetails={true}
        enablePoweredByContainer={false}
        styles={{
          container: styles.autocompleteContainer,
          textInputContainer: {
            ...styles.textInputContainer,
            ...(!value && required && styles.requiredInput),
          },
          textInput: styles.textInput,
          listView: styles.listView,
          row: styles.row,
          description: styles.description,
          separator: styles.separator,
        }}
        textInputProps={{
          placeholderTextColor: '#9CA3AF',
          returnKeyType: 'search',
        }}
        renderLeftButton={() => (
          <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
        )}
        renderRightButton={() => (
          <MaterialIcons name="keyboard-arrow-down" size={24} color="#666" style={styles.arrowIcon} />
        )}
        nearbyPlacesAPI="GooglePlacesSearch"
        GooglePlacesSearchQuery={{
          rankby: 'distance',
        }}
        GooglePlacesDetailsQuery={{
          fields: 'place_id,formatted_address,name,geometry,address_components',
        }}
        filterReverseGeocodingByTypes={[
          'locality',
          'administrative_area_level_3',
        ]}
        debounce={300}
        onFail={(error: any) => {
          console.error('❌ Erreur GooglePlacesAutocomplete:', error);
        }}
        onNotFound={() => {
          console.log('🔍 Aucun résultat trouvé');
        }}
        listEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="location-off" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              Aucune adresse trouvée
            </Text>
          </View>
        )}
      />
      
      {!value && required && (
        <Text style={styles.errorText}>Veuillez sélectionner une adresse valide</Text>
      )}
      
      {value && (
        <View style={styles.selectedAddressContainer}>
          <View style={styles.selectedAddressItem}>
            <MaterialIcons name="check-circle" size={16} color="#10B981" />
            <Text style={styles.selectedAddressText}>
              Adresse sélectionnée: {value}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  requiredLabel: {
    color: '#DC2626',
  },
  autocompleteContainer: {
    flex: 0,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 48,
  },
  requiredInput: {
    borderColor: '#FCA5A5',
  },
  textInput: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
    marginLeft: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  arrowIcon: {
    marginLeft: 8,
  },
  listView: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  description: {
    fontSize: 14,
    color: '#111827',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
  selectedAddressContainer: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  selectedAddressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedAddressText: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: '500',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 12,
    color: '#F59E0B',
    marginTop: 8,
    fontStyle: 'italic',
  },
});