# 🗺️ Guide de configuration des cartes pour BraPrime

## ❌ Problème rencontré

L'erreur `TurboModuleRegistry.getEnforcing(...): 'RNMapsAirModule' could not be found` indique que `react-native-maps` n'est pas compatible avec Expo Go.

## ✅ Solutions disponibles

### Option 1: Version simple (Recommandée pour Expo Go)

Utilisez la page `/select-location` qui fonctionne avec Expo Go :

- ✅ Recherche d'adresses avec Google Places
- ✅ Sélection manuelle de coordonnées
- ✅ Interface moderne et intuitive
- ✅ Compatible avec Expo Go

### Option 2: Version avec carte interactive (WebView)

Utilisez la page `/select-location-webview` avec Google Maps dans une WebView :

- ✅ Carte interactive Google Maps
- ✅ Sélection par clic sur la carte
- ✅ Compatible avec Expo Go
- ⚠️ Nécessite une clé API Google Maps

### Option 3: Configuration native (EAS Build)

Pour utiliser `react-native-maps` avec une vraie carte native :

- ✅ Carte native performante
- ✅ Toutes les fonctionnalités avancées
- ❌ Nécessite EAS Build
- ❌ Pas compatible avec Expo Go

## 🚀 Utilisation immédiate

### Version simple (Recommandée)

La version simple est déjà configurée et fonctionnelle :

1. **Page de sélection** : `/select-location`
2. **Recherche d'adresses** : Utilise les données de test pour Conakry
3. **Sélection manuelle** : Possibilité d'entrer des coordonnées GPS
4. **Intégration checkout** : Fonctionne parfaitement

### Fonctionnalités disponibles

- ✅ Recherche d'adresses (Marché de Madina, Aéroport, etc.)
- ✅ Validation d'adresse
- ✅ Points de repère
- ✅ Calcul des frais de livraison
- ✅ Estimation du temps de livraison

## 🔧 Configuration pour carte interactive

Si vous voulez utiliser la version avec carte interactive :

### 1. Obtenir une clé API Google Maps

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un projet ou sélectionnez un existant
3. Activez l'API "Maps JavaScript API"
4. Créez une clé API
5. Restreignez la clé pour la sécurité

### 2. Configurer la clé API

Dans `components/MapWebView.tsx`, remplacez :

```typescript
src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap">
```

Par votre vraie clé API :

```typescript
src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBvotre_cle_api_ici&callback=initMap">
```

### 3. Utiliser la version WebView

Dans `app/checkout.tsx`, changez la navigation :

```typescript
// Au lieu de :
router.push('/select-location')

// Utilisez :
router.push('/select-location-webview')
```

## 📱 Configuration native (Option avancée)

Si vous voulez utiliser `react-native-maps` avec une vraie carte native :

### 1. Prérequis

- Compte Expo Pro ou EAS Build
- Configuration pour build natif

### 2. Configuration EAS

```bash
# Installer EAS CLI
npm install -g @expo/eas-cli

# Configurer le projet
eas build:configure

# Créer un build de développement
eas build --profile development --platform ios
eas build --profile development --platform android
```

### 3. Configuration des clés API

#### Android
Dans `app.json` :
```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "VOTRE_CLE_API_ANDROID"
        }
      }
    }
  }
}
```

#### iOS
Dans `app.json` :
```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "VOTRE_CLE_API_IOS"
      }
    }
  }
}
```

### 4. Utiliser la version native

Une fois configuré, vous pouvez utiliser la version native avec `react-native-maps`.

## 🎯 Recommandation

### Pour le développement et les tests

Utilisez la **version simple** (`/select-location`) :
- ✅ Fonctionne immédiatement
- ✅ Pas de configuration complexe
- ✅ Compatible avec Expo Go
- ✅ Données de test pour Conakry

### Pour la production

1. **Phase 1** : Utilisez la version simple avec vraie API Google Places
2. **Phase 2** : Migrez vers la version WebView pour plus d'interactivité
3. **Phase 3** : Considérez la version native pour les performances

## 🔍 Test de la fonctionnalité

### Test de la version simple

1. Lancez l'application
2. Allez sur la page de checkout
3. Sélectionnez "Livraison"
4. Cliquez sur "Sélectionner une adresse"
5. Testez la recherche (ex: "Marché de Madina")
6. Sélectionnez une adresse
7. Ajoutez un point de repère
8. Confirmez l'adresse

### Test de la version WebView

1. Remplacez la navigation dans checkout
2. Configurez votre clé API Google Maps
3. Testez la sélection sur la carte
4. Vérifiez le géocodage inverse

## 🛠️ Dépannage

### Erreur "RNMapsAirModule not found"

**Solution** : Utilisez la version simple ou WebView au lieu de `react-native-maps`

### Erreur "Google Maps API key"

**Solution** : Configurez votre clé API dans le composant MapWebView

### Erreur "Location permission denied"

**Solution** : Ajoutez les permissions dans `app.json` :

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Cette application a besoin d'accéder à votre localisation pour vous aider à sélectionner votre adresse de livraison."
        }
      ]
    ]
  }
}
```

## 📞 Support

Pour toute question :
1. Consultez la documentation Expo
2. Vérifiez la configuration des clés API
3. Testez avec la version simple d'abord
4. Contactez l'équipe de développement 