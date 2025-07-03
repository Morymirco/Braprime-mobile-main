# Test Google Maps - BraPrime

## ✅ Configuration terminée

Votre clé API Google Maps est maintenant configurée :
- **Clé API** : `AIzaSyAaZ74jJVrh-FTSerYhYWzJ6Jxif8L18pM`
- **Page** : `/select-location-google`
- **Composant** : `components/GoogleMaps.tsx`

## 🚀 Test rapide

### 1. Lancer l'application
```bash
npx expo start --clear
```

### 2. Accéder à Google Maps
- L'app va automatiquement rediriger vers Google Maps après la sélection de langue
- Ou naviguez manuellement vers `/select-location-google`

### 3. Tester les fonctionnalités
- ✅ **Carte interactive** : Zoom, déplacement, clic
- ✅ **Marqueur glissable** : Faites glisser le marqueur rouge
- ✅ **Recherche d'adresses** : Tapez dans la barre de recherche
- ✅ **Sélection d'emplacement** : Cliquez sur la carte
- ✅ **Géocodage inverse** : Obtient l'adresse depuis les coordonnées

## 🎯 Fonctionnalités disponibles

### Carte Google Maps
- **Zoom** : Pincez pour zoomer/dézoomer
- **Déplacement** : Glissez pour naviguer
- **Sélection** : Cliquez pour placer le marqueur
- **Marqueur** : Faites glisser le marqueur rouge

### Recherche d'adresses
- **Barre de recherche** : Tapez une adresse
- **Résultats** : Liste des adresses trouvées
- **Sélection** : Cliquez sur un résultat

### Informations d'emplacement
- **Adresse complète** : Affichée automatiquement
- **Quartier** : Extrait de l'adresse
- **Point de repère** : Champ optionnel pour la livraison

## 🔧 Dépannage

### Si la carte ne se charge pas :
1. **Vérifiez la connexion internet**
2. **Regardez les logs** dans la console
3. **Vérifiez la clé API** dans Google Cloud Console

### Si vous voyez une erreur "API key not valid" :
1. **Vérifiez que la clé est correcte**
2. **Vérifiez que les APIs sont activées** :
   - Maps JavaScript API
   - Geocoding API
   - Places API

### Si la recherche ne fonctionne pas :
1. **Vérifiez le service LocationService**
2. **Regardez les logs** pour les erreurs
3. **Testez avec une adresse simple** (ex: "Conakry")

## 📱 Test sur différents appareils

### iOS Simulator
- ✅ Fonctionne parfaitement
- ✅ Toutes les fonctionnalités disponibles

### Android Emulator
- ✅ Fonctionne parfaitement
- ✅ Toutes les fonctionnalités disponibles

### Appareil physique
- ✅ Fonctionne parfaitement
- ✅ GPS disponible pour la localisation

## 🎉 Succès !

Si vous voyez :
- ✅ Une carte Google Maps interactive
- ✅ Un marqueur rouge sur Conakry
- ✅ La possibilité de cliquer et déplacer
- ✅ La recherche d'adresses qui fonctionne

Alors **Google Maps fonctionne parfaitement** ! 🎉

## 🔄 Alternatives disponibles

Si Google Maps ne fonctionne pas, vous pouvez utiliser :

1. **OpenStreetMap** : `/select-location-osm` (gratuit)
2. **React Native Maps** : `/select-location-native` (natif)
3. **Carte statique** : `/select-location` (simple)

## 📞 Support

En cas de problème :
1. Vérifiez les logs dans la console
2. Testez avec OpenStreetMap en premier
3. Vérifiez la configuration de la clé API
4. Consultez la documentation Google Maps 