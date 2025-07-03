// Service pour gérer les appels à l'API Google Places
// Note: Vous devrez configurer votre clé API Google Places

export interface Place {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  types: string[];
}

export interface Location {
  address: string;
  latitude: number;
  longitude: number;
  neighborhood: string;
  landmark?: string;
}

class LocationService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor() {
    // Remplacez par votre clé API Google Places
    this.apiKey = 'YOUR_GOOGLE_PLACES_API_KEY';
  }

  /**
   * Rechercher des lieux avec Google Places API
   */
  async searchPlaces(query: string, location?: { lat: number; lng: number }): Promise<Place[]> {
    try {
      // Si pas de clé API, utiliser les données de test
      if (this.apiKey === 'YOUR_GOOGLE_PLACES_API_KEY') {
        return this.getMockPlaces(query);
      }

      const params = new URLSearchParams({
        input: query,
        inputtype: 'textquery',
        key: this.apiKey,
        language: 'fr',
        types: 'establishment',
        fields: 'place_id,name,formatted_address,geometry,types'
      });

      if (location) {
        params.append('locationbias', `point:${location.lat},${location.lng}`);
      }

      const response = await fetch(`${this.baseUrl}/place/findplacefromtext/json?${params}`);
      const data = await response.json();

      if (data.status === 'OK') {
        return data.candidates.map((place: any) => ({
          id: place.place_id,
          name: place.name,
          address: place.formatted_address,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          types: place.types || []
        }));
      }

      return [];
    } catch (error) {
      console.error('Erreur lors de la recherche de lieux:', error);
      return this.getMockPlaces(query);
    }
  }

  /**
   * Obtenir les détails d'un lieu avec Google Places API
   */
  async getPlaceDetails(placeId: string): Promise<Place | null> {
    try {
      if (this.apiKey === 'YOUR_GOOGLE_PLACES_API_KEY') {
        return this.getMockPlaceById(placeId);
      }

      const params = new URLSearchParams({
        place_id: placeId,
        key: this.apiKey,
        language: 'fr',
        fields: 'place_id,name,formatted_address,geometry,types'
      });

      const response = await fetch(`${this.baseUrl}/place/details/json?${params}`);
      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        const place = data.result;
        return {
          id: place.place_id,
          name: place.name,
          address: place.formatted_address,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          types: place.types || []
        };
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du lieu:', error);
      return this.getMockPlaceById(placeId);
    }
  }

  /**
   * Géocodage inverse (coordonnées vers adresse)
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<Location | null> {
    try {
      if (this.apiKey === 'YOUR_GOOGLE_PLACES_API_KEY') {
        return this.getMockReverseGeocode(latitude, longitude);
      }

      const params = new URLSearchParams({
        latlng: `${latitude},${longitude}`,
        key: this.apiKey,
        language: 'fr'
      });

      const response = await fetch(`${this.baseUrl}/geocode/json?${params}`);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const addressComponents = result.address_components;

        // Extraire le quartier
        const neighborhood = addressComponents.find((component: any) =>
          component.types.includes('sublocality') || component.types.includes('neighborhood')
        )?.long_name || 'Quartier inconnu';

        return {
          address: result.formatted_address,
          latitude,
          longitude,
          neighborhood
        };
      }

      return null;
    } catch (error) {
      console.error('Erreur lors du géocodage inverse:', error);
      return this.getMockReverseGeocode(latitude, longitude);
    }
  }

  /**
   * Données de test pour Conakry
   */
  private getMockPlaces(query: string): Place[] {
    const mockPlaces: Place[] = [
      {
        id: '1',
        name: 'Aéroport International de Conakry',
        address: 'Aéroport International de Conakry, Conakry',
        latitude: 9.5769,
        longitude: -13.6120,
        types: ['airport']
      },
      {
        id: '2',
        name: 'Marché de Madina',
        address: 'Marché de Madina, Conakry',
        latitude: 9.5370,
        longitude: -13.6785,
        types: ['market']
      },
      {
        id: '3',
        name: 'Palais du Peuple',
        address: 'Palais du Peuple, Conakry',
        latitude: 9.5370,
        longitude: -13.6785,
        types: ['government']
      },
      {
        id: '4',
        name: 'Université Gamal Abdel Nasser',
        address: 'Université Gamal Abdel Nasser, Conakry',
        latitude: 9.5370,
        longitude: -13.6785,
        types: ['university']
      },
      {
        id: '5',
        name: 'Hôpital Ignace Deen',
        address: 'Hôpital Ignace Deen, Conakry',
        latitude: 9.5370,
        longitude: -13.6785,
        types: ['hospital']
      },
      {
        id: '6',
        name: 'Station Total Kaloum',
        address: 'Station Total Kaloum, Conakry',
        latitude: 9.5370,
        longitude: -13.6785,
        types: ['gas_station']
      },
      {
        id: '7',
        name: 'Banque Centrale de la République de Guinée',
        address: 'Banque Centrale, Conakry',
        latitude: 9.5370,
        longitude: -13.6785,
        types: ['bank']
      },
      {
        id: '8',
        name: 'Gare Routière de Conakry',
        address: 'Gare Routière, Conakry',
        latitude: 9.5370,
        longitude: -13.6785,
        types: ['bus_station']
      },
      {
        id: '9',
        name: 'Centre Commercial Kaloum',
        address: 'Centre Commercial Kaloum, Conakry',
        latitude: 9.5370,
        longitude: -13.6785,
        types: ['shopping_mall']
      },
      {
        id: '10',
        name: 'Restaurant Le Damier',
        address: 'Restaurant Le Damier, Conakry',
        latitude: 9.5370,
        longitude: -13.6785,
        types: ['restaurant']
      }
    ];

    // Filtrer les résultats basés sur la requête
    return mockPlaces.filter(place =>
      place.name.toLowerCase().includes(query.toLowerCase()) ||
      place.address.toLowerCase().includes(query.toLowerCase())
    );
  }

  private getMockPlaceById(placeId: string): Place | null {
    const mockPlaces = this.getMockPlaces('');
    return mockPlaces.find(place => place.id === placeId) || null;
  }

  private getMockReverseGeocode(latitude: number, longitude: number): Location {
    return {
      address: `Adresse sélectionnée (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
      latitude,
      longitude,
      neighborhood: 'Quartier sélectionné'
    };
  }

  /**
   * Valider une adresse
   */
  validateAddress(address: string): boolean {
    return address.trim().length > 0;
  }

  /**
   * Calculer la distance entre deux points
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance en km
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const locationService = new LocationService();
 