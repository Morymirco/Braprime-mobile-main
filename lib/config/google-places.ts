// Configuration Google Places pour BraPrime Mobile
import { ENV_CONFIG } from './env';

export const GOOGLE_PLACES_CONFIG = {
  // Clé API Google Places (à configurer selon votre projet)
  API_KEY: ENV_CONFIG.GOOGLE_PLACES_API_KEY,
  
  // Configuration des requêtes
  QUERY_CONFIG: {
    language: 'fr',           // Langue française
    components: 'country:gn', // Limiter à la Guinée
    types: ['address'],       // Types de lieux recherchés
  },
  
  // Configuration de l'autocomplétion
  AUTOCOMPLETE_CONFIG: {
    minLength: 2,             // Longueur minimale pour déclencher la recherche
    debounce: 200,            // Délai de debounce en ms
    maxResults: 10,           // Nombre maximum de résultats
  },
  
  // Configuration de la géolocalisation
  GEOLOCATION_CONFIG: {
    enableHighAccuracy: true,
    timeout: 10000,           // 10 secondes
    maximumAge: 60000,        // 1 minute
  },
  
  // Adresses communes en Guinée (fallback)
  COMMON_ADDRESSES: [
    {
      id: '1',
      description: 'Kaloum, Conakry, Guinée',
      commune: 'Kaloum',
      quartier: 'Centre-ville',
      coordinates: { lat: 9.5370, lng: -13.6785 }
    },
    {
      id: '2',
      description: 'Ratoma, Conakry, Guinée',
      commune: 'Ratoma',
      quartier: 'Ratoma',
      coordinates: { lat: 9.5667, lng: -13.6833 }
    },
    {
      id: '3',
      description: 'Dixinn, Conakry, Guinée',
      commune: 'Dixinn',
      quartier: 'Dixinn',
      coordinates: { lat: 9.5500, lng: -13.7000 }
    },
    {
      id: '4',
      description: 'Matam, Conakry, Guinée',
      commune: 'Matam',
      quartier: 'Matam',
      coordinates: { lat: 9.5333, lng: -13.7167 }
    },
    {
      id: '5',
      description: 'Matoto, Conakry, Guinée',
      commune: 'Matoto',
      quartier: 'Matoto',
      coordinates: { lat: 9.5167, lng: -13.7333 }
    },
    {
      id: '6',
      description: 'Almamya, Conakry, Guinée',
      commune: 'Almamya',
      quartier: 'Almamya',
      coordinates: { lat: 9.5000, lng: -13.7500 }
    },
    {
      id: '7',
      description: 'Kagbelen, Conakry, Guinée',
      commune: 'Kagbelen',
      quartier: 'Kagbelen',
      coordinates: { lat: 9.4833, lng: -13.7667 }
    },
    {
      id: '8',
      description: 'Coyah, Guinée',
      commune: 'Coyah',
      quartier: 'Coyah',
      coordinates: { lat: 9.7500, lng: -13.4167 }
    },
    {
      id: '9',
      description: 'Kindia, Guinée',
      commune: 'Kindia',
      quartier: 'Kindia',
      coordinates: { lat: 10.0500, lng: -12.8667 }
    },
    {
      id: '10',
      description: 'Kankan, Guinée',
      commune: 'Kankan',
      quartier: 'Kankan',
      coordinates: { lat: 10.3833, lng: -9.3000 }
    }
  ]
};

// Fonctions utilitaires pour Google Places
export const GooglePlacesUtils = {
  // Extraire la commune depuis les composants d'adresse Google
  extractCommune: (place: any): string => {
    if (!place.address_components) return '';
    
    const communeComponent = place.address_components.find((component: any) => 
      component.types.includes('administrative_area_level_1')
    );
    
    return communeComponent?.long_name || '';
  },
  
  // Extraire le quartier depuis les composants d'adresse Google
  extractQuartier: (place: any): string => {
    if (!place.address_components) return '';
    
    // Chercher d'abord sublocality_level_1, puis sublocality
    const quartierComponent = place.address_components.find((component: any) => 
      component.types.includes('sublocality_level_1') || 
      component.types.includes('sublocality')
    );
    
    return quartierComponent?.long_name || '';
  },
  
  // Extraire les coordonnées GPS
  extractCoordinates: (place: any): { lat: number; lng: number } => {
    if (!place.geometry?.location) return { lat: 0, lng: 0 };
    
    return {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };
  },
  
  // Valider une adresse
  validateAddress: (address: string): boolean => {
    return address.trim().length > 0 && address.includes('Guinée');
  },
  
  // Formater une adresse pour l'affichage
  formatAddress: (place: any): string => {
    if (!place.formatted_address) return '';
    
    // Nettoyer l'adresse (enlever les doublons)
    let address = place.formatted_address;
    
    // Si l'adresse se termine par "Guinée", c'est bon
    if (address.endsWith('Guinée')) {
      return address;
    }
    
    // Sinon, ajouter "Guinée" si pas présent
    if (!address.includes('Guinée')) {
      address += ', Guinée';
    }
    
    return address;
  }
};

// Types pour Google Places
export interface GooglePlace {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  name?: string;
  types?: string[];
}

export interface AddressData {
  address: string;
  commune: string;
  quartier: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
}
