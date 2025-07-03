# 🗺️ Solutions de carte pour BraPrime

## 🚨 Problème : "Je ne vois pas la carte"

Vous avez plusieurs options pour résoudre ce problème :

## ✅ Solution 1: OpenStreetMap (Recommandée - GRATUITE)

**Fichier** : `/select-location-osm`
**Avantages** :
- ✅ Carte interactive complète
- ✅ Gratuit, pas de clé API nécessaire
- ✅ Compatible avec Expo Go
- ✅ Fonctionne immédiatement

**Utilisation** :
- La navigation est déjà configurée dans le checkout
- Cliquez sur "Sélectionner une adresse" dans le checkout
- Vous verrez une vraie carte interactive

## ✅ Solution 2: Google Maps WebView (Avec clé API)

**Fichier** : `/select-location-webview`
**Avantages** :
- ✅ Carte Google Maps interactive
- ✅ Interface familière
- ⚠️ Nécessite une clé API Google Maps

**Configuration** :
1. Obtenir une clé API Google Maps
2. Modifier `components/MapWebView.tsx`
3. Changer la navigation dans checkout vers `/select-location-webview`

## ✅ Solution 3: Version simple (Sans carte)

**Fichier** : `/select-location`
**Avantages** :
- ✅ Fonctionne immédiatement
- ✅ Recherche d'adresses
- ✅ Sélection manuelle de coordonnées
- ❌ Pas de carte interactive

## 🚀 Solution recommandée : OpenStreetMap

La version OpenStreetMap est déjà configurée et fonctionne immédiatement :

### Test rapide :
1. Lancez l'application
2. Allez sur la page de checkout
3. Sélectionnez "Livraison"
4. Cliquez sur "Sélectionner une adresse"
5. Vous verrez une vraie carte interactive !

### Fonctionnalités :
- ✅ Carte interactive avec zoom
- ✅ Clic pour sélectionner un emplacement
- ✅ Glisser-déposer du marqueur
- ✅ Recherche d'adresses
- ✅ Géocodage inverse
- ✅ Points de repère

## 🔧 Si vous voulez changer de solution

### Pour utiliser Google Maps :
```typescript
// Dans app/checkout.tsx, changez :
onEdit={() => router.push('/select-location-osm')}
// Par :
onEdit={() => router.push('/select-location-webview')}
```

### Pour utiliser la version simple :
```typescript
// Dans app/checkout.tsx, changez :
onEdit={() => router.push('/select-location-osm')}
// Par :
onEdit={() => router.push('/select-location')}
```

## 📱 Test de la fonctionnalité

1. **Lancez l'application** : `npm start`
2. **Allez sur checkout** : Ajoutez un article au panier puis checkout
3. **Sélectionnez livraison** : Choisissez "Livraison"
4. **Cliquez sur sélectionner adresse** : Vous verrez la carte !
5. **Testez la carte** :
   - Cliquez sur la carte pour sélectionner
   - Glissez le marqueur
   - Utilisez la recherche d'adresses
6. **Confirmez l'adresse** : Ajoutez un point de repère et confirmez

## 🎯 Recommandation finale

**Utilisez OpenStreetMap** (`/select-location-osm`) car :
- ✅ Fonctionne immédiatement
- ✅ Carte interactive complète
- ✅ Gratuit et sans configuration
- ✅ Compatible avec Expo Go
- ✅ Toutes les fonctionnalités nécessaires

La carte devrait maintenant s'afficher correctement ! 🎉 