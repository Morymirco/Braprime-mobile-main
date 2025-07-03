# Test Google Maps - Version Simplifiée

## ✅ Configuration actuelle

- **Clé API** : `AIzaSyAaZ74jJVrh-FTSerYhYWzJ6Jxif8L18pM`
- **Page unique** : `/select-location` (Google Maps)
- **Composant** : `components/GoogleMaps.tsx`

## 🚀 Test immédiat

### 1. Lancer l'application
```bash
npx expo start --clear
```

### 2. Accéder à la carte
- Sélectionnez une langue sur l'écran de splash
- L'app va automatiquement rediriger vers Google Maps

### 3. Vérifier que la carte s'affiche
- ✅ Une carte Google Maps interactive devrait apparaître
- ✅ Un marqueur rouge devrait être visible sur Conakry
- ✅ Vous devriez pouvoir zoomer et déplacer la carte

## 🔧 Si la carte ne s'affiche pas

### Vérification 1 : Logs de la console
Ouvrez la console et vérifiez les messages :
- `Google Maps WebView: Début du chargement`
- `Message reçu de Google Maps: {type: 'map_loaded'}`

### Vérification 2 : Clé API
Vérifiez que la clé API est correcte dans `components/GoogleMaps.tsx` :
```typescript
apiKey = 'AIzaSyAaZ74jJVrh-FTSerYhYWzJ6Jxif8L18pM'
```

### Vérification 3 : Connexion internet
- Assurez-vous d'avoir une connexion internet active
- Google Maps nécessite internet pour charger les tuiles

### Vérification 4 : APIs activées
Dans Google Cloud Console, vérifiez que ces APIs sont activées :
- Maps JavaScript API
- Geocoding API
- Places API

## 🎯 Fonctionnalités à tester

1. **Carte interactive** :
   - Zoom avec les doigts
   - Déplacement en glissant
   - Clic pour placer le marqueur

2. **Recherche d'adresses** :
   - Tapez dans la barre de recherche
   - Sélectionnez un résultat

3. **Sélection d'emplacement** :
   - Cliquez sur la carte
   - Faites glisser le marqueur

## 📱 Test sur différents appareils

### iOS Simulator
- ✅ Devrait fonctionner parfaitement

### Android Emulator
- ✅ Devrait fonctionner parfaitement

### Appareil physique
- ✅ Devrait fonctionner parfaitement

## 🚨 Problèmes courants

### "API key not valid"
- Vérifiez la clé API dans le code
- Vérifiez les restrictions de domaine dans Google Cloud Console

### "Carte blanche"
- Vérifiez la connexion internet
- Vérifiez que les APIs sont activées

### "WebView ne se charge pas"
- Vérifiez que `react-native-webview` est installé
- Redémarrez l'app avec `--clear`

## 🎉 Succès !

Si vous voyez :
- ✅ Une carte Google Maps avec des rues et bâtiments
- ✅ Un marqueur rouge sur Conakry
- ✅ La possibilité de zoomer et déplacer
- ✅ La recherche d'adresses qui fonctionne

Alors **Google Maps fonctionne parfaitement** ! 🎉

## 📞 Support

En cas de problème persistant :
1. Vérifiez les logs dans la console
2. Testez sur un autre appareil
3. Vérifiez la configuration Google Cloud Console
4. Redémarrez l'app avec `npx expo start --clear` 