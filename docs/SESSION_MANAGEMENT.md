# Gestion de Session Utilisateur

## Vue d'ensemble

Ce document décrit l'implémentation du système de gestion de session utilisateur dans l'application BraPrime Mobile. Le système assure la persistance des sessions, la validation automatique des tokens, et la synchronisation avec Supabase.

## Architecture

### Services principaux

1. **SessionService** (`lib/services/SessionService.ts`)
   - Gestion de la persistance locale des sessions
   - Validation et rafraîchissement des tokens
   - Synchronisation avec Supabase

2. **AuthService** (`lib/services/AuthService.ts`)
   - Authentification avec Supabase
   - Gestion des profils utilisateur
   - Récupération des sessions Supabase

3. **AuthContext** (`lib/contexts/AuthContext.tsx`)
   - État global de l'authentification
   - Gestion des changements de session
   - Validation périodique

### Composants

1. **AuthGuard** (`lib/components/AuthGuard.tsx`)
   - Protection des routes
   - Redirection automatique
   - Validation de session

2. **SessionInfo** (`components/SessionInfo.tsx`)
   - Affichage des informations de session
   - Actions de rafraîchissement
   - Statistiques détaillées

### Hooks

1. **useAuth** (`lib/contexts/AuthContext.tsx`)
   - Accès aux données d'authentification
   - Actions de connexion/déconnexion
   - Mise à jour du profil

2. **useUserPreferences** (`hooks/useUserPreferences.ts`)
   - Gestion des préférences utilisateur
   - Persistance locale
   - Synchronisation des paramètres

## Fonctionnalités

### Gestion de session

- **Persistance locale** : Sauvegarde automatique des sessions dans AsyncStorage
- **Validation automatique** : Vérification périodique de la validité des tokens
- **Rafraîchissement automatique** : Renouvellement des tokens avant expiration
- **Synchronisation** : Mise à jour avec Supabase en cas de désynchronisation

### Sécurité

- **Expiration automatique** : Déconnexion automatique après expiration
- **Validation des tokens** : Vérification de l'intégrité des tokens
- **Protection des routes** : Accès contrôlé aux pages protégées
- **Gestion des erreurs** : Traitement robuste des erreurs d'authentification

### Expérience utilisateur

- **Connexion transparente** : Reconnexion automatique si session valide
- **Indicateurs visuels** : Statut de session visible
- **Actions manuelles** : Possibilité de rafraîchir manuellement
- **Gestion des préférences** : Sauvegarde des paramètres utilisateur

## Utilisation

### Protection des routes

```tsx
import { AuthGuard } from '../lib/components/AuthGuard';

export default function ProtectedPage() {
  return (
    <AuthGuard>
      <YourComponent />
    </AuthGuard>
  );
}
```

### Accès aux données d'authentification

```tsx
import { useAuth } from '../lib/contexts/AuthContext';

export default function MyComponent() {
  const { user, isAuthenticated, sessionValid, signOut } = useAuth();

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return (
    <View>
      <Text>Bonjour {user?.name}</Text>
      <Button onPress={signOut} title="Déconnexion" />
    </View>
  );
}
```

### Gestion des préférences

```tsx
import { useUserPreferences } from '../hooks/useUserPreferences';

export default function PreferencesScreen() {
  const { preferences, updateTheme, updateNotifications } = useUserPreferences();

  return (
    <View>
      <Switch
        value={preferences.notifications.push}
        onValueChange={(value) => updateNotifications({ push: value })}
      />
    </View>
  );
}
```

## Structure des données

### UserSession

```typescript
interface UserSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  lastActivity: number;
}
```

### UserPreferences

```typescript
interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  location: {
    latitude?: number;
    longitude?: number;
    address?: string;
    city?: string;
  };
  delivery: {
    defaultAddress?: string;
    preferredTime?: string;
    instructions?: string;
  };
  privacy: {
    shareLocation: boolean;
    shareProfile: boolean;
    analytics: boolean;
  };
}
```

## Flux d'authentification

### 1. Initialisation

1. **Démarrage de l'app** : Chargement de la session locale
2. **Validation** : Vérification de la validité avec Supabase
3. **Synchronisation** : Mise à jour si nécessaire
4. **État final** : Utilisateur connecté ou redirection vers login

### 2. Connexion

1. **Authentification** : Vérification des identifiants
2. **Création de session** : Génération des tokens
3. **Sauvegarde locale** : Persistance de la session
4. **Mise à jour de l'état** : Notification du contexte

### 3. Validation périodique

1. **Vérification** : Contrôle de la validité toutes les 5 minutes
2. **Rafraîchissement** : Renouvellement automatique si nécessaire
3. **Mise à jour** : Synchronisation avec Supabase
4. **Notification** : Mise à jour de l'interface

### 4. Déconnexion

1. **Déconnexion Supabase** : Invalidation des tokens
2. **Nettoyage local** : Suppression de la session locale
3. **Mise à jour de l'état** : Notification du contexte
4. **Redirection** : Navigation vers la page de connexion

## Gestion des erreurs

### Types d'erreurs

1. **Erreurs de réseau** : Problèmes de connectivité
2. **Erreurs d'authentification** : Tokens invalides
3. **Erreurs de synchronisation** : Désynchronisation avec Supabase
4. **Erreurs de stockage** : Problèmes avec AsyncStorage

### Stratégies de récupération

1. **Nouvelle tentative** : Tentative automatique de reconnexion
2. **Fallback local** : Utilisation des données locales si possible
3. **Synchronisation forcée** : Mise à jour complète depuis Supabase
4. **Déconnexion forcée** : Nettoyage et redirection vers login

## Performance

### Optimisations

- **Cache local** : Réduction des appels réseau
- **Validation différée** : Vérification périodique au lieu de systématique
- **Stockage optimisé** : Utilisation efficace d'AsyncStorage
- **Gestion d'état** : Mise à jour minimale des composants

### Monitoring

- **Logs détaillés** : Suivi des opérations de session
- **Métriques de performance** : Temps de réponse et taux de succès
- **Alertes d'erreur** : Notification des problèmes critiques
- **Statistiques d'utilisation** : Analyse des patterns d'utilisation

## Sécurité

### Mesures de protection

1. **Validation des tokens** : Vérification de l'intégrité
2. **Expiration automatique** : Déconnexion après timeout
3. **Chiffrement local** : Protection des données sensibles
4. **Validation côté serveur** : Double vérification avec Supabase

### Bonnes pratiques

1. **Ne jamais stocker les mots de passe** : Utilisation des tokens uniquement
2. **Validation systématique** : Vérification avant chaque opération
3. **Nettoyage automatique** : Suppression des données obsolètes
4. **Logs sécurisés** : Pas d'informations sensibles dans les logs

## Tests

### Tests unitaires

- Validation des services de session
- Gestion des erreurs
- Persistance des données
- Synchronisation avec Supabase

### Tests d'intégration

- Flux complet d'authentification
- Gestion des timeouts
- Récupération après erreur
- Performance sous charge

### Tests utilisateur

- Expérience de connexion
- Gestion des cas d'erreur
- Performance perçue
- Facilité d'utilisation

## Maintenance

### Surveillance

- **Monitoring des sessions** : Suivi des statistiques d'utilisation
- **Alertes de sécurité** : Notification des tentatives d'intrusion
- **Analyse des erreurs** : Identification des problèmes récurrents
- **Optimisation continue** : Amélioration des performances

### Mises à jour

- **Mise à jour des dépendances** : Maintien à jour des bibliothèques
- **Amélioration de la sécurité** : Application des dernières recommandations
- **Optimisation des performances** : Amélioration continue
- **Nouvelles fonctionnalités** : Ajout de capacités selon les besoins

## Support

### Documentation

- **Guides utilisateur** : Instructions pour les utilisateurs finaux
- **Documentation technique** : Référence pour les développeurs
- **FAQ** : Questions fréquemment posées
- **Exemples de code** : Snippets d'utilisation

### Assistance

- **Support technique** : Aide pour les problèmes techniques
- **Formation** : Sessions de formation pour les équipes
- **Consultation** : Accompagnement pour les implémentations
- **Maintenance** : Services de maintenance continue 