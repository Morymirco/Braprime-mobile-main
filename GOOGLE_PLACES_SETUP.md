# Configuration Google Places API

## Étapes de configuration

### 1. Obtenir une clé API Google Places

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet ou sélectionner un projet existant
3. Activer l'API "Places API" et "Geocoding API"
4. Créer des identifiants (clé API)
5. Restreindre la clé API à l'application mobile

### 2. Configuration dans l'application

Ajouter la clé API dans le fichier `.env` :

```env
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

### 3. Restriction de la clé API

Pour la sécurité, restreindre la clé API à :
- **Application** : Android/iOS
- **Package name** : com.yourcompany.braprime (ou le nom de votre package)
- **SHA-1 fingerprint** : (pour Android)

### 4. Fonctionnalités activées

- ✅ Autocomplétion d'adresses
- ✅ Géocodage inversé
- ✅ Détails des lieux
- ✅ Restriction à la Guinée (country:gn)
- ✅ Langue française

### 5. Utilisation dans le code

Le composant `AddressAutocomplete` utilise automatiquement la clé API configurée dans `process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY`.

### 6. Coûts

- **Autocomplétion** : $2.83 pour 1000 requêtes
- **Détails des lieux** : $17.00 pour 1000 requêtes
- **Géocodage** : $5.00 pour 1000 requêtes

### 7. Limites

- 1000 requêtes gratuites par mois pour les nouvelles clés
- Quota par défaut : 1000 requêtes/jour
- Peut être augmenté selon les besoins

## Dépannage

### Erreur "This API project is not authorized"
- Vérifier que l'API Places est activée
- Vérifier les restrictions de la clé API

### Erreur "REQUEST_DENIED"
- Vérifier la clé API
- Vérifier les restrictions (package name, SHA-1)

### Aucune suggestion d'adresse
- Vérifier la connexion internet
- Vérifier que la clé API est correcte
- Vérifier les quotas

### Erreur "Cannot read property 'filter' of undefined"
- Cette erreur peut survenir si la clé API n'est pas configurée
- Le composant affichera automatiquement un TextInput simple en fallback
- Configurer la clé API pour activer l'autocomplétion

### Mode fallback
Si la clé API Google Places n'est pas configurée, le composant `AddressAutocomplete` :
- Affiche un TextInput simple
- Montre un avertissement "Google Places API non configuré"
- Permet la saisie manuelle d'adresse
- Maintient la validation et les styles
