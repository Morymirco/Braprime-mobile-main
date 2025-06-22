# Système de Profil Utilisateur - BraPrime

## Vue d'ensemble

Le système de profil utilisateur de BraPrime permet aux utilisateurs de gérer leurs informations personnelles, y compris leur nom, numéro de téléphone, adresse e-mail et photo de profil.

## Architecture

### 1. Base de données

La table `profiles` stocke les informations utilisateur :

```sql
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE,
    phone TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Hook personnalisé : `useProfile`

Le hook `useProfile` fournit toutes les fonctionnalités de gestion du profil :

```typescript
const {
  profile,           // Données du profil actuel
  loading,           // État de chargement
  error,             // Erreurs éventuelles
  fetchProfile,      // Récupérer le profil
  updateProfile,     // Mettre à jour le profil
  updateAvatar,      // Mettre à jour l'avatar
  clearError         // Effacer les erreurs
} = useProfile();
```

### 3. Composant réutilisable : `ProfileInfo`

Le composant `ProfileInfo` affiche les informations du profil de manière cohérente :

```typescript
<ProfileInfo 
  showAvatar={true}
  showEmail={true}
  showPhone={true}
  size="medium"
/>
```

## Fonctionnalités

### 1. Affichage du profil

- **Écran principal** (`app/profile/index.tsx`) : Affiche les informations du profil avec un bouton pour les modifier
- **Composant ProfileInfo** : Réutilisable dans toute l'application

### 2. Édition du profil

- **Écran d'édition** (`app/profile/edit.tsx`) : Permet de modifier le nom et le numéro de téléphone
- **Sélection d'image** : Intégration avec l'appareil photo et la galerie
- **Validation** : Vérification des champs obligatoires
- **Sauvegarde** : Mise à jour en temps réel dans la base de données

### 3. Gestion des erreurs

- Affichage des erreurs de chargement
- Gestion des erreurs de mise à jour
- Messages d'erreur en français
- États de chargement avec indicateurs visuels

## Utilisation

### 1. Dans un écran

```typescript
import { useProfile } from '../hooks/useProfile';

export default function MonEcran() {
  const { profile, loading, updateProfile } = useProfile();

  if (loading) {
    return <Text>Chargement...</Text>;
  }

  return (
    <View>
      <Text>Bonjour {profile?.full_name}</Text>
    </View>
  );
}
```

### 2. Avec le composant ProfileInfo

```typescript
import ProfileInfo from '../components/ProfileInfo';

export default function MonEcran() {
  return (
    <View>
      <ProfileInfo size="large" />
    </View>
  );
}
```

### 3. Mise à jour du profil

```typescript
const { updateProfile } = useProfile();

const handleUpdate = async () => {
  const result = await updateProfile({
    full_name: 'Nouveau nom',
    phone: '+224123456789'
  });

  if (result.success) {
    console.log('Profil mis à jour !');
  } else {
    console.error('Erreur:', result.error);
  }
};
```

## Sécurité

### 1. Politiques RLS (Row Level Security)

Les politiques RLS garantissent que les utilisateurs ne peuvent accéder qu'à leur propre profil :

```sql
-- Lecture du profil
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Mise à jour du profil
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
```

### 2. Validation côté client

- Vérification des champs obligatoires
- Validation des formats (email, téléphone)
- Protection contre les injections

## Tests

### Script de test

Le script `scripts/test-profile-expo.js` permet de tester :

1. **Récupération de profil** : Vérifier l'accès aux données
2. **Mise à jour de profil** : Tester les modifications
3. **Création d'utilisateur** : Vérifier la création automatique du profil
4. **Politiques RLS** : Tester la sécurité

### Exécution des tests

```bash
# Configurer les clés Supabase dans le script
node scripts/test-profile-expo.js
```

## Configuration requise

### 1. Variables d'environnement

```env
EXPO_PUBLIC_SUPABASE_URL=votre_url_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme
```

### 2. Permissions

- **Appareil photo** : Pour la sélection d'images
- **Galerie** : Pour l'accès aux photos existantes

### 3. Dépendances

```json
{
  "expo-image-picker": "^14.0.0",
  "@supabase/supabase-js": "^2.0.0"
}
```

## Dépannage

### Problèmes courants

1. **Profil non trouvé**
   - Vérifier que l'utilisateur est connecté
   - Contrôler les politiques RLS
   - Vérifier la création automatique du profil

2. **Erreurs de mise à jour**
   - Vérifier les permissions de la base de données
   - Contrôler la validation des données
   - Vérifier la connexion réseau

3. **Images non sauvegardées**
   - Implémenter l'upload vers Supabase Storage
   - Vérifier les permissions de stockage
   - Contrôler la taille des images

### Logs de débogage

```typescript
// Activer les logs détaillés
const { profile, error } = useProfile();
console.log('Profil:', profile);
console.log('Erreur:', error);
```

## Améliorations futures

1. **Upload d'images** : Intégration avec Supabase Storage
2. **Validation avancée** : Validation côté serveur
3. **Cache local** : Mise en cache des données de profil
4. **Synchronisation** : Synchronisation en temps réel
5. **Historique** : Historique des modifications

## Support

Pour toute question ou problème :

1. Vérifier la documentation Supabase
2. Consulter les logs d'erreur
3. Tester avec le script de test
4. Vérifier la configuration de la base de données 