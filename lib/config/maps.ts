// Configuration pour Google Maps
export const MAPS_CONFIG = {
  // Clé API Google Maps
  GOOGLE_MAPS_API_KEY: 'AIzaSyBQ8uIPeWgjk9692eBJ_Tch51tPRDahU9Y',
  
  // Configuration par défaut de la carte
  DEFAULT_REGION: {
    latitude: 9.6412, // Conakry, Guinée
    longitude: -13.5784,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  
  // Types de cartes disponibles
  MAP_TYPES: {
    STANDARD: 'standard',
    SATELLITE: 'satellite',
    HYBRID: 'hybrid',
  } as const,
  
  // Types de lieux pour la recherche
  PLACE_TYPES: {
    RESTAURANT: 'restaurant',
    PHARMACY: 'pharmacy',
    GAS_STATION: 'gas_station',
    BANK: 'bank',
    HOSPITAL: 'hospital',
    SHOPPING: 'shopping_mall',
    ATM: 'atm',
    PARKING: 'parking',
  } as const,
  
  // Configuration des marqueurs
  MARKER_CONFIG: {
    DEFAULT_COLOR: '#E31837',
    START_COLOR: '#4CAF50',
    END_COLOR: '#E31837',
    CURRENT_LOCATION_COLOR: '#2196F3',
  },
  
  // Configuration des polylines
  POLYLINE_CONFIG: {
    STROKE_COLOR: '#E31837',
    STROKE_WIDTH: 4,
  },
};

// Fonction pour obtenir la clé API
export const getGoogleMapsApiKey = (): string => {
  // En production, vous devriez utiliser des variables d'environnement
  return MAPS_CONFIG.GOOGLE_MAPS_API_KEY;
};

// Fonction pour valider la configuration
export const validateMapsConfig = (): boolean => {
  return MAPS_CONFIG.GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY';
};

// Messages d'erreur
export const MAPS_ERRORS = {
  API_KEY_MISSING: 'Clé API Google Maps manquante',
  LOCATION_PERMISSION_DENIED: 'Permission de localisation refusée',
  LOCATION_UNAVAILABLE: 'Localisation non disponible',
  GEOCODING_FAILED: 'Échec du géocodage',
  ROUTE_CALCULATION_FAILED: 'Échec du calcul d\'itinéraire',
} as const;
