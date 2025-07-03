# 🗺️ Configuration Google Places API

## 📋 Vue d'ensemble

Ce guide vous explique comment configurer l'API Google Places pour la sélection d'adresses dans l'application BraPrime.

## 🔑 Étape 1: Obtenir une clé API Google

### 1. Accéder à Google Cloud Console
- Allez sur [Google Cloud Console](https://console.cloud.google.com/)
- Connectez-vous avec votre compte Google

### 2. Créer un nouveau projet
- Cliquez sur le sélecteur de projet en haut
- Cliquez sur "Nouveau projet"
- Nommez votre projet (ex: "BraPrime Mobile")
- Cliquez sur "Créer"

### 3. Activer les APIs nécessaires
Dans votre projet, activez les APIs suivantes :
- **Places API** - Pour la recherche de lieux
- **Geocoding API** - Pour le géocodage inverse
- **Maps SDK for Android** - Pour les cartes Android
- **Maps SDK for iOS** - Pour les cartes iOS

### 4. Créer une clé API
- Allez dans "APIs & Services" > "Credentials"
- Cliquez sur "Create Credentials" > "API Key"
- Copiez votre clé API

## 📱 Étape 2: Configuration dans l'application

### 1. Mettre à jour le service LocationService

Ouvrez le fichier `lib/services/LocationService.ts` et remplacez :

```typescript
this.apiKey = 'YOUR_GOOGLE_PLACES_API_KEY';
```

Par votre vraie clé API :

```typescript
this.apiKey = 'AIzaSyBvotre_cle_api_ici';
```

### 2. Configuration Android

#### Ajouter la clé API dans `android/app/src/main/AndroidManifest.xml` :

```xml
<application>
  <!-- Autres configurations -->
  
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="VOTRE_CLE_API_ICI" />
</application>
```

#### Ajouter les permissions dans `android/app/src/main/AndroidManifest.xml` :

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

### 3. Configuration iOS

#### Ajouter la clé API dans `ios/YourApp/AppDelegate.mm` :

```objc
#import <GoogleMaps/GoogleMaps.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [GMSServices provideAPIKey:@"VOTRE_CLE_API_ICI"];
  // ... reste du code
}
```

#### Ajouter les permissions dans `ios/YourApp/Info.plist` :

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Cette application a besoin d'accéder à votre localisation pour vous aider à sélectionner votre adresse de livraison.</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Cette application a besoin d'accéder à votre localisation pour vous aider à sélectionner votre adresse de livraison.</string>
```

## 🔒 Étape 3: Sécurisation de la clé API

### 1. Restreindre la clé API
Dans Google Cloud Console :
- Allez dans "APIs & Services" > "Credentials"
- Cliquez sur votre clé API
- Dans "Application restrictions", sélectionnez "Android apps" et/ou "iOS apps"
- Ajoutez vos empreintes SHA-1 (Android) et Bundle ID (iOS)

### 2. Limiter les APIs
Dans les restrictions de la clé :
- Sélectionnez uniquement les APIs nécessaires :
  - Places API
  - Geocoding API
  - Maps SDK for Android
  - Maps SDK for iOS

### 3. Variables d'environnement (Recommandé)
Créez un fichier `.env` :

```env
GOOGLE_PLACES_API_KEY=VOTRE_CLE_API_ICI
```

Et utilisez-le dans le code :

```typescript
this.apiKey = process.env.GOOGLE_PLACES_API_KEY || 'YOUR_GOOGLE_PLACES_API_KEY';
```

## 🧪 Étape 4: Test de la configuration

### 1. Tester la recherche de lieux
```typescript
import { locationService } from '../lib/services/LocationService';

// Test de recherche
const places = await locationService.searchPlaces('Marché de Madina');
console.log('Résultats:', places);
```

### 2. Tester le géocodage inverse
```typescript
const location = await locationService.reverseGeocode(9.5370, -13.6785);
console.log('Adresse:', location);
```

## 📊 Étape 5: Monitoring et facturation

### 1. Surveiller l'utilisation
- Allez dans Google Cloud Console > "APIs & Services" > "Dashboard"
- Surveillez les requêtes et les erreurs

### 2. Configurer les alertes
- Configurez des alertes pour les quotas
- Surveillez les coûts dans "Billing"

### 3. Optimiser les coûts
- Utilisez le cache pour les requêtes fréquentes
- Limitez les champs demandés dans les requêtes
- Implémentez la pagination pour les résultats

## 🚀 Fonctionnalités disponibles

### ✅ Recherche de lieux
- Recherche par nom d'établissement
- Recherche par adresse
- Filtrage par type de lieu

### ✅ Sélection sur carte
- Clic sur la carte pour sélectionner
- Géocodage inverse automatique
- Validation des coordonnées

### ✅ Validation d'adresse
- Vérification de la validité
- Extraction du quartier
- Support des points de repère

### ✅ Calculs de distance
- Calcul des frais de livraison
- Estimation du temps de livraison
- Vérification de la zone de livraison

## 🔧 Dépannage

### Erreur "API key not valid"
- Vérifiez que la clé API est correcte
- Vérifiez que les APIs sont activées
- Vérifiez les restrictions de la clé

### Erreur "Quota exceeded"
- Vérifiez votre quota dans Google Cloud Console
- Optimisez vos requêtes
- Considérez l'upgrade de votre plan

### Erreur "Location permission denied"
- Vérifiez les permissions dans le manifeste
- Demandez les permissions à l'exécution
- Gérer le cas où l'utilisateur refuse

## 📞 Support

Pour toute question ou problème :
1. Consultez la [documentation Google Places API](https://developers.google.com/maps/documentation/places/web-service)
2. Vérifiez les [forums Google Cloud](https://cloud.google.com/support)
3. Contactez l'équipe de développement BraPrime 