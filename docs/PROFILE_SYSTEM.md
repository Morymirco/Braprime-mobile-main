# Système de Profil BraPrime

## Vue d'ensemble

Le système de profil de BraPrime offre une gestion complète des informations utilisateur, des préférences et des paramètres de l'application. Il inclut la gestion multilingue, les paramètres de confidentialité, et une interface utilisateur moderne et intuitive.

## Fonctionnalités principales

### 1. Gestion du Profil Utilisateur

#### Page Profil Principale (`/profile`)
- **Affichage des informations** : Nom, email, téléphone, bio, rôle
- **Modification rapide** : Bouton pour accéder à l'édition du profil
- **Sélection de langue** : Affichage de la langue actuelle avec navigation
- **Paramètres avancés** : Accès aux paramètres détaillés
- **Gestion des cartes** : Ajout et gestion des méthodes de paiement
- **Choix de carte** : Sélection entre Google Maps et Apple Maps

#### Page d'Édition du Profil (`/profile/edit`)
- **Informations personnelles** :
  - Nom complet (obligatoire)
  - Numéro de téléphone
  - Adresse email (non modifiable)
  - Bio (description personnelle)
- **Informations supplémentaires** :
  - Site web
  - Ville
  - Code postal
- **Photo de profil** : Sélection depuis la galerie ou l'appareil photo
- **Sauvegarde** : Mise à jour en temps réel avec validation
- **Suppression de compte** : Option sécurisée avec confirmation

### 2. Système Multilingue

#### Contexte de Langue (`LanguageContext`)
- **Langues supportées** : Français, Anglais, Arabe
- **Persistance** : Sauvegarde automatique dans AsyncStorage
- **Traductions complètes** : Interface entièrement traduite
- **Support RTL** : Interface adaptée pour l'arabe

#### Page de Sélection de Langue (`/profile/language`)
- **Interface intuitive** : Sélection avec drapeaux et noms natifs
- **Prévisualisation** : Affichage de la langue actuelle
- **Sauvegarde automatique** : Changement immédiat de la langue
- **Redémarrage** : Notification pour appliquer les changements

### 3. Paramètres Avancés

#### Page Paramètres (`/profile/settings`)
- **Notifications** :
  - Notifications push
  - Notifications par email
  - Notifications SMS
- **Confidentialité** :
  - Partage de localisation
  - Profil public/privé
  - Analytics et données d'utilisation
- **Apparence** :
  - Thème (clair/sombre/automatique)
- **Régional** :
  - Devise (GNF/USD/EUR)
- **Réinitialisation** : Option pour remettre à zéro tous les paramètres

### 4. Gestion des Préférences

#### Hook `useUserPreferences`
- **Synchronisation** : Entre AsyncStorage et Supabase
- **Persistance** : Sauvegarde automatique des changements
- **Valeurs par défaut** : Configuration initiale optimale
- **Gestion d'erreurs** : Gestion robuste des erreurs de connexion

## Architecture Technique

### Structure des Fichiers

```
app/profile/
├── index.tsx          # Page profil principale
├── edit.tsx           # Édition du profil
├── language.tsx       # Sélection de langue
└── settings.tsx       # Paramètres avancés

lib/contexts/
├── LanguageContext.tsx # Contexte de gestion des langues
└── AuthContext.tsx     # Contexte d'authentification

hooks/
├── useProfile.ts      # Gestion du profil utilisateur
└── useUserPreferences.ts # Gestion des préférences

components/
├── ProfileSkeleton.tsx # Skeleton loader pour le profil
└── SessionInfo.tsx     # Informations de session
```

### Base de Données

#### Table `user_profiles`
```sql
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name varchar NOT NULL,
  email varchar UNIQUE NOT NULL,
  phone_number varchar,
  bio text,
  website text,
  city text,
  postal_code text,
  profile_image text,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

#### Table `app_settings`
```sql
CREATE TABLE app_settings (
  id integer PRIMARY KEY,
  key varchar UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

### Types TypeScript

#### UserProfile
```typescript
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  bio?: string;
  website?: string;
  city?: string;
  postal_code?: string;
  profile_image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

#### UserPreferences
```typescript
interface UserPreferences {
  language: 'fr' | 'en' | 'ar';
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  privacy: {
    shareLocation: boolean;
    shareProfile: boolean;
    analytics: boolean;
  };
  mapProvider: 'google' | 'apple' | 'osm';
  currency: 'GNF' | 'USD' | 'EUR';
  timezone: string;
}
```

## Utilisation

### Intégration dans l'Application

1. **Provider Principal** : Le `LanguageProvider` doit envelopper l'application
2. **Hooks** : Utiliser `useProfile()` et `useUserPreferences()` dans les composants
3. **Traductions** : Utiliser `useLanguage()` pour accéder aux traductions

### Exemple d'Utilisation

```typescript
import { useProfile } from '../hooks/useProfile';
import { useLanguage } from '../lib/contexts/LanguageContext';
import { useUserPreferences } from '../hooks/useUserPreferences';

function MyComponent() {
  const { profile, updateProfile } = useProfile();
  const { t, language } = useLanguage();
  const { preferences, updatePreferences } = useUserPreferences();

  // Utilisation des traductions
  const title = t('profile.title');

  // Mise à jour du profil
  const handleUpdateProfile = async () => {
    await updateProfile({ name: 'Nouveau nom' });
  };

  // Mise à jour des préférences
  const handleUpdateLanguage = async () => {
    await updatePreferences({ language: 'en' });
  };

  return (
    <View>
      <Text>{title}</Text>
      <Text>{profile?.name}</Text>
    </View>
  );
}
```

## Fonctionnalités Avancées

### 1. Gestion des Images

- **Sélection** : Galerie ou appareil photo
- **Édition** : Recadrage automatique 1:1
- **Compression** : Optimisation de la qualité (0.8)
- **Upload** : Intégration future avec Supabase Storage

### 2. Validation des Données

- **Nom obligatoire** : Validation côté client
- **Email unique** : Validation côté serveur
- **Format téléphone** : Validation du format
- **Taille bio** : Limitation à 500 caractères

### 3. Gestion d'Erreurs

- **Connexion** : Gestion des erreurs réseau
- **Validation** : Messages d'erreur localisés
- **Fallback** : Valeurs par défaut en cas d'erreur
- **Retry** : Mécanisme de retry automatique

### 4. Performance

- **Lazy Loading** : Chargement à la demande
- **Caching** : Mise en cache des préférences
- **Optimistic Updates** : Mise à jour immédiate de l'UI
- **Debouncing** : Limitation des appels API

## Sécurité

### 1. Authentification

- **Vérification** : Contrôle de l'authentification
- **Session** : Gestion des sessions utilisateur
- **Permissions** : Contrôle d'accès aux données

### 2. Données Sensibles

- **Chiffrement** : Stockage sécurisé des préférences
- **Validation** : Sanitisation des entrées utilisateur
- **Audit** : Logs des modifications importantes

### 3. Confidentialité

- **RGPD** : Conformité avec les réglementations
- **Consentement** : Gestion des consentements utilisateur
- **Suppression** : Suppression complète des données

## Tests

### Tests Unitaires

```typescript
// Test du hook useProfile
describe('useProfile', () => {
  it('should load profile data', async () => {
    // Test implementation
  });

  it('should update profile successfully', async () => {
    // Test implementation
  });
});
```

### Tests d'Intégration

```typescript
// Test de la page profil
describe('ProfileScreen', () => {
  it('should display user information', () => {
    // Test implementation
  });

  it('should navigate to edit profile', () => {
    // Test implementation
  });
});
```

## Maintenance

### 1. Ajout de Nouvelles Langues

1. Ajouter la langue dans `LanguageContext.tsx`
2. Créer les traductions dans l'objet `translations`
3. Mettre à jour les types TypeScript
4. Tester l'interface RTL si nécessaire

### 2. Ajout de Nouveaux Paramètres

1. Étendre l'interface `UserPreferences`
2. Ajouter les valeurs par défaut
3. Créer l'interface utilisateur
4. Implémenter la logique de sauvegarde

### 3. Mise à Jour de la Base de Données

1. Créer les migrations SQL
2. Mettre à jour les types TypeScript
3. Tester la compatibilité
4. Déployer les changements

## Conclusion

Le système de profil de BraPrime offre une expérience utilisateur complète et moderne, avec une gestion robuste des données, une interface multilingue, et des paramètres personnalisables. L'architecture modulaire permet une maintenance facile et l'ajout de nouvelles fonctionnalités. 