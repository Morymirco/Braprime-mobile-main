# Configuration Google Maps pour BraPrime Mobile

Ce guide explique comment configurer et utiliser Google Maps dans l'application mobile BraPrime.

## 📋 Prérequis

1. **Compte Google Cloud Platform** avec facturation activée
2. **Clé API Google Maps** avec les APIs suivantes activées :
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API
   - Directions API
   - Geocoding API

## 🔧 Configuration

### 1. Obtenir une clé API Google Maps

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez les APIs nécessaires :
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API
   - Directions API
   - Geocoding API
4. Créez des identifiants (clé API)
5. Configurez les restrictions de sécurité

### 2. Configuration dans l'application

#### Option A : Configuration directe (développement)
Modifiez le fichier `lib/config/maps.ts` :
```typescript
export const MAPS_CONFIG = {
  GOOGLE_MAPS_API_KEY: 'VOTRE_CLE_API_ICI',
  // ... autres configurations
};
```

#### Option B : Variables d'environnement (production)
1. Créez un fichier `.env` :
```bash
GOOGLE_MAPS_API_KEY=votre_cle_api_ici
```

2. Modifiez `lib/config/maps.ts` :
```typescript
export const getGoogleMapsApiKey = (): string => {
  return process.env.GOOGLE_MAPS_API_KEY || MAPS_CONFIG.GOOGLE_MAPS_API_KEY;
};
```

### 3. Configuration Expo

Le fichier `app.json` est déjà configuré avec le plugin `react-native-maps`. Assurez-vous que votre clé API est correcte :

```json
{
  "plugins": [
    [
      "react-native-maps",
      {
        "googleMapsApiKey": "VOTRE_CLE_API_ICI"
      }
    ]
  ]
}
```

## 🚀 Utilisation

### Pages de test disponibles

1. **Test de carte interactive** (`/map-test`)
   - Géolocalisation automatique
   - Ajout de marqueurs
   - Contrôles de carte
   - Types de cartes

2. **Sélecteur de localisation** (`/location-picker`)
   - Recherche d'adresses
   - Sélection par tap
   - Géocodage inverse

3. **Planificateur d'itinéraire** (`/route-planner`)
   - Points de départ/arrivée
   - Calcul d'itinéraire
   - Informations de route

4. **Lieux à proximité** (`/nearby-places`)
   - Recherche de lieux
   - Filtres par type
   - Liste interactive

### Service MapsService

Le service `MapsService` fournit des méthodes utilitaires :

```typescript
import { MapsService } from '../lib/services/MapsService';

// Obtenir la position actuelle
const location = await MapsService.getCurrentLocation();

// Géocodage inverse
const address = await MapsService.reverseGeocode(lat, lng);

// Géocodage direct
const coordinates = await MapsService.geocode('Conakry, Guinée');

// Calculer la distance
const distance = MapsService.calculateDistance(lat1, lng1, lat2, lng2);
```

## 🔒 Sécurité

### Restrictions de clé API

Configurez les restrictions suivantes dans Google Cloud Console :

1. **Restrictions d'application** :
   - Android : Package name + SHA-1 fingerprint
   - iOS : Bundle identifier

2. **Restrictions d'API** :
   - Limitez aux APIs nécessaires uniquement

3. **Restrictions de quota** :
   - Définissez des limites quotidiennes
   - Surveillez l'utilisation

### Exemple de configuration de sécurité

```bash
# Package name Android
com.bratech.prime

# Bundle identifier iOS
com.bratech.prime

# APIs autorisées
- Maps SDK for Android
- Maps SDK for iOS
- Places API
- Directions API
- Geocoding API
```

## 🐛 Dépannage

### Erreurs courantes

1. **"API key not found"**
   - Vérifiez que la clé API est correcte
   - Assurez-vous que les APIs sont activées

2. **"This API project is not authorized"**
   - Vérifiez les restrictions de l'application
   - Ajoutez le package name/bundle identifier

3. **"Quota exceeded"**
   - Vérifiez les limites de quota
   - Augmentez les limites si nécessaire

4. **Carte ne s'affiche pas**
   - Vérifiez la configuration dans `app.json`
   - Redémarrez l'application après modification

### Logs de débogage

Activez les logs dans `MapsService.ts` :
```typescript
console.log('Position actuelle:', location);
console.log('Adresse trouvée:', address);
```

## 📱 Test sur différents appareils

### Android
```bash
expo run:android
```

### iOS
```bash
expo run:ios
```

### Simulateur/Émulateur
```bash
expo start
```

## 🔄 Mise à jour

Pour mettre à jour `react-native-maps` :
```bash
npm update react-native-maps
```

Puis redémarrez l'application.

## 📚 Ressources

- [Documentation react-native-maps](https://github.com/react-native-maps/react-native-maps)
- [Google Maps Platform](https://developers.google.com/maps)
- [Expo Maps](https://docs.expo.dev/versions/latest/sdk/map-view/)

## 🆘 Support

En cas de problème :
1. Vérifiez les logs de l'application
2. Consultez la documentation Google Maps
3. Vérifiez la configuration de votre clé API
4. Testez sur un appareil physique si possible
