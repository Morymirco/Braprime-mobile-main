# Configuration Google Maps pour BraPrime

## Vue d'ensemble

Ce guide vous explique comment configurer Google Maps dans votre application BraPrime pour la sélection d'adresses de livraison.

## Options disponibles

### 1. **Google Maps avec WebView** (Recommandé)
- **Fichier** : `/select-location-google`
- **Composant** : `components/GoogleMaps.tsx`
- **Avantages** : Fonctionne avec Expo Go, pas besoin de build natif
- **Inconvénients** : Nécessite une clé API Google Maps

### 2. **OpenStreetMap** (Gratuit)
- **Fichier** : `/select-location-osm`
- **Composant** : `components/OpenStreetMap.tsx`
- **Avantages** : Gratuit, pas besoin de clé API
- **Inconvénients** : Moins de fonctionnalités que Google Maps

### 3. **Carte statique** (Simple)
- **Fichier** : `/select-location`
- **Avantages** : Très simple, pas de dépendances externes
- **Inconvénients** : Pas interactive, juste un placeholder

## Configuration Google Maps

### Étape 1 : Obtenir une clé API Google Maps

1. **Allez sur Google Cloud Console** :
   - https://console.cloud.google.com/

2. **Créez un nouveau projet** ou sélectionnez un projet existant

3. **Activez les APIs nécessaires** :
   - Maps JavaScript API
   - Geocoding API
   - Places API

4. **Créez des clés API** :
   - Allez dans "APIs & Services" > "Credentials"
   - Cliquez sur "Create Credentials" > "API Key"
   - Copiez la clé générée

### Étape 2 : Configurer les restrictions de la clé API

1. **Cliquez sur la clé API** pour la modifier
2. **Ajoutez des restrictions** :
   - **Application restrictions** : "HTTP referrers (web sites)"
   - **API restrictions** : Sélectionnez les APIs activées
3. **Ajoutez les domaines autorisés** :
   - `localhost`
   - `127.0.0.1`
   - Votre domaine de production

### Étape 3 : Intégrer la clé dans l'app

1. **Modifiez le composant GoogleMaps** :
   ```typescript
   // Dans components/GoogleMaps.tsx
   apiKey = 'VOTRE_CLE_API_ICI'
   ```

2. **Ou utilisez une variable d'environnement** :
   ```typescript
   // Dans components/GoogleMaps.tsx
   apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'VOTRE_CLE_API_ICI'
   ```

3. **Créez un fichier .env** :
   ```env
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=VOTRE_CLE_API_ICI
   ```

### Étape 4 : Tester la configuration

1. **Lancez l'app** :
   ```bash
   npx expo start --clear
   ```

2. **Accédez à la page Google Maps** :
   - Naviguez vers `/select-location-google`
   - Ou modifiez la navigation dans `splash.tsx`

3. **Vérifiez les logs** :
   - Ouvrez la console pour voir les messages de débogage
   - Vérifiez que la carte se charge correctement

## Utilisation dans l'application

### Navigation vers Google Maps

```typescript
// Dans n'importe quel fichier
import { router } from 'expo-router';

// Naviguer vers Google Maps
router.push('/select-location-google');
```

### Modification du splash screen

```typescript
// Dans app/splash.tsx, ligne 35
const handleLanguageSelect = (language: string) => {
  console.log('🌍 Langue sélectionnée:', language);
  router.replace('/select-location-google'); // Utiliser Google Maps
};
```

### Modification du checkout

```typescript
// Dans app/checkout.tsx, ligne 335
onEdit={() => router.push('/select-location-google')}
```

## Fonctionnalités disponibles

### Google Maps offre :
- ✅ Carte interactive avec zoom et déplacement
- ✅ Sélection d'emplacement par clic
- ✅ Marqueur glissable
- ✅ Géocodage inverse automatique
- ✅ Interface utilisateur moderne
- ✅ Support multi-plateforme

### Comparaison des options :

| Fonctionnalité | Google Maps | OpenStreetMap | Carte statique |
|----------------|-------------|---------------|----------------|
| Interactivité | ✅ | ✅ | ❌ |
| Géocodage | ✅ | ✅ | ❌ |
| Gratuit | ❌ | ✅ | ✅ |
| Qualité des données | ✅ | ✅ | ❌ |
| Performance | ✅ | ✅ | ✅ |

## Dépannage

### Erreur "Google Maps JavaScript API error"
- Vérifiez que la clé API est correcte
- Vérifiez que les APIs sont activées
- Vérifiez les restrictions de domaine

### Carte ne se charge pas
- Vérifiez la connexion internet
- Vérifiez les logs dans la console
- Vérifiez que la WebView fonctionne

### Erreur de quota
- Google Maps a des limites d'utilisation
- Considérez OpenStreetMap pour les tests
- Surveillez l'utilisation dans Google Cloud Console

## Recommandations

### Pour le développement :
- Utilisez **OpenStreetMap** (`/select-location-osm`) car :
  - Gratuit et sans limite
  - Pas besoin de configuration
  - Fonctionne immédiatement

### Pour la production :
- Utilisez **Google Maps** (`/select-location-google`) car :
  - Données plus précises
  - Interface plus familière
  - Meilleure performance

### Pour les tests :
- Utilisez la **carte statique** (`/select-location`) car :
  - Très simple
  - Pas de dépendances externes
  - Parfait pour tester la logique

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans la console
2. Testez avec OpenStreetMap en premier
3. Vérifiez la configuration de la clé API
4. Consultez la documentation Google Maps 