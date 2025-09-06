import * as Location from 'expo-location';
import { MAPS_ERRORS } from '../config/maps';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
}

export interface PlaceData {
  id: string;
  name: string;
  address: string;
  coordinate: { latitude: number; longitude: number };
  type: string;
  rating?: number;
  distance?: number;
}

export interface RouteData {
  coordinates: Array<{ latitude: number; longitude: number }>;
  distance: string;
  duration: string;
}

export class MapsService {
  /**
   * Demande les permissions de localisation
   */
  static async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      return false;
    }
  }

  /**
   * Obtient la position actuelle de l'utilisateur
   */
  static async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        throw new Error(MAPS_ERRORS.LOCATION_PERMISSION_DENIED);
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      };
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
      throw error;
    }
  }

  /**
   * Géocodage inverse : coordonnées → adresse
   */
  static async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length === 0) {
        throw new Error(MAPS_ERRORS.GEOCODING_FAILED);
      }

      const locationData = reverseGeocode[0];
      const address = [
        locationData.street,
        locationData.name,
        locationData.city,
        locationData.region,
        locationData.country,
      ]
        .filter(Boolean)
        .join(', ');

      return address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      console.error('Erreur de géocodage inverse:', error);
      throw error;
    }
  }

  /**
   * Géocodage direct : adresse → coordonnées
   */
  static async geocode(address: string): Promise<LocationData[]> {
    try {
      const geocode = await Location.geocodeAsync(address);
      
      if (geocode.length === 0) {
        throw new Error(MAPS_ERRORS.GEOCODING_FAILED);
      }

      return geocode.map(location => ({
        latitude: location.latitude,
        longitude: location.longitude,
      }));
    } catch (error) {
      console.error('Erreur de géocodage:', error);
      throw error;
    }
  }

  /**
   * Calcule la distance entre deux points (formule de Haversine)
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  /**
   * Convertit les degrés en radians
   */
  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Génère des lieux de test pour le développement
   */
  static generateTestPlaces(centerLat: number, centerLon: number): PlaceData[] {
    const places: PlaceData[] = [
      {
        id: '1',
        name: 'Restaurant Le Gourmet',
        address: 'Rue de la République, Conakry',
        coordinate: { latitude: centerLat + 0.001, longitude: centerLon + 0.001 },
        type: 'restaurant',
        rating: 4.5,
        distance: 0.2,
      },
      {
        id: '2',
        name: 'Pharmacie Centrale',
        address: 'Avenue de la Paix, Conakry',
        coordinate: { latitude: centerLat - 0.001, longitude: centerLon + 0.002 },
        type: 'pharmacy',
        rating: 4.2,
        distance: 0.3,
      },
      {
        id: '3',
        name: 'Station Shell',
        address: 'Boulevard du Commerce, Conakry',
        coordinate: { latitude: centerLat + 0.002, longitude: centerLon - 0.001 },
        type: 'gas_station',
        rating: 3.8,
        distance: 0.4,
      },
      {
        id: '4',
        name: 'Banque UGB',
        address: 'Place de l\'Indépendance, Conakry',
        coordinate: { latitude: centerLat - 0.002, longitude: centerLon - 0.002 },
        type: 'bank',
        rating: 4.0,
        distance: 0.5,
      },
      {
        id: '5',
        name: 'Hôpital Ignace Deen',
        address: 'Quartier Almamya, Conakry',
        coordinate: { latitude: centerLat + 0.003, longitude: centerLon + 0.003 },
        type: 'hospital',
        rating: 4.3,
        distance: 0.6,
      },
    ];

    return places;
  }

  /**
   * Simule le calcul d'un itinéraire
   * Dans une vraie application, vous utiliseriez l'API Google Directions
   */
  static calculateRoute(
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number
  ): RouteData {
    // Simulation d'un itinéraire avec des points intermédiaires
    const coordinates = [
      { latitude: startLat, longitude: startLon },
      {
        latitude: (startLat + endLat) / 2 + 0.001,
        longitude: (startLon + endLon) / 2 + 0.001,
      },
      { latitude: endLat, longitude: endLon },
    ];

    // Simulation de la distance et durée
    const distance = this.calculateDistance(startLat, startLon, endLat, endLon);
    const duration = Math.round(distance * 2 + Math.random() * 10); // ~2 min/km + variation

    return {
      coordinates,
      distance: `${distance.toFixed(1)} km`,
      duration: `${duration} min`,
    };
  }

  /**
   * Valide si les coordonnées sont valides
   */
  static isValidCoordinate(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180 &&
      !isNaN(latitude) &&
      !isNaN(longitude)
    );
  }

  /**
   * Formate les coordonnées pour l'affichage
   */
  static formatCoordinates(latitude: number, longitude: number): string {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
}
