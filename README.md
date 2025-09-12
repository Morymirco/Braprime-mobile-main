# BraPrime Mobile App

Application mobile de livraison et services pour la Guinée, construite avec React Native et Expo.

## 🚀 Installation

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn
- Expo CLI
- Compte Supabase

### Étapes d'installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd Braprime-mobile-main
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration de la base de données**
   
   **IMPORTANT** : Vous devez d'abord exécuter le schéma de base de données dans Supabase.
   
   ```bash
   # Afficher le schéma SQL
   node scripts/setup-database.js
   ```
   
   Ensuite, suivez ces étapes :
   1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
   2. Sélectionnez votre projet
   3. Allez dans "SQL Editor"
   4. Copiez le contenu du fichier `database/schema.sql`
   5. Collez-le dans l'éditeur et cliquez sur "Run"

4. **Configuration de l'authentification par email**
   
   L'application utilise l'authentification par email (Magic Link) via Supabase. Configurez :
   
   Puis suivez les étapes :
   1. Activez "Email Auth" dans Supabase Auth > Providers
   2. Configurez les templates d'email
   3. Ajoutez les URLs de redirection

5. **Démarrer l'application**
   ```bash
   npm start
   ```

## 📱 Fonctionnalités

### Authentification
- ✅ Connexion par email (Magic Link)
- ✅ Envoi automatique de liens de connexion
- ✅ Gestion des erreurs et retry
- ✅ Protection des routes authentifiées
- ✅ Pas besoin de service SMS externe

### Profil Utilisateur
- ✅ Gestion complète du profil utilisateur
- ✅ Édition du nom et numéro de téléphone
- ✅ Sélection de photo de profil (appareil photo/galerie)
- ✅ Sauvegarde automatique en base de données
- ✅ Interface moderne et intuitive
- ✅ Validation des champs obligatoires
- ✅ Gestion des erreurs et états de chargement

### Base de données
- ✅ Schéma complet avec toutes les tables nécessaires
- ✅ Politiques de sécurité (RLS) configurées
- ✅ Triggers automatiques pour les profils utilisateurs
- ✅ Données initiales (catégories)

### Interface utilisateur
- ✅ Écran de connexion avec validation email
- ✅ Interface moderne et intuitive
- ✅ Navigation par onglets
- ✅ Design responsive

## 🏗️ Architecture

```
app/
├── (tabs)/           # Pages principales (protégées par AuthGuard)
├── profile/          # Gestion du profil utilisateur
│   ├── index.tsx     # Affichage du profil
│   └── edit.tsx      # Édition du profil
├── login.tsx         # Écran de connexion par email
└── _layout.tsx       # Layout principal avec AuthProvider

lib/
├── contexts/
│   └── AuthContext.tsx    # Contexte d'authentification
├── components/
│   └── AuthGuard.tsx      # Protection des routes
├── hooks/
│   ├── useSupabaseAuth.ts # Hook d'authentification
│   └── useProfile.ts      # Hook de gestion du profil
└── supabase/
    └── config.ts          # Configuration Supabase

components/
└── ProfileInfo.tsx        # Composant d'affichage du profil

hooks/
└── useProfile.ts          # Hook de gestion du profil

database/
└── schema.sql             # Schéma de base de données
```

## 🔧 Configuration

### Variables d'environnement
L'application utilise les clés Supabase suivantes (déjà configurées) :
- URL: `https://gehvdncxbcfotnabmjmo.supabase.co`
- Clé anonyme: Configurée dans `lib/supabase/config.ts`

### Base de données
Le schéma inclut les tables suivantes :
- `profiles` - Profils utilisateurs (email unique)
- `addresses` - Adresses de livraison
- `categories` - Catégories de services
- `stores` - Magasins et restaurants
- `products` - Produits
- `orders` - Commandes
- `order_items` - Éléments de commande
- `wallets` - Portefeuilles utilisateurs
- `wallet_transactions` - Transactions
- `favorites` - Favoris

## 👤 Système de Profil

### Fonctionnalités
- **Affichage du profil** : Nom, email, téléphone et photo
- **Édition du profil** : Modification du nom et numéro de téléphone
- **Photo de profil** : Sélection depuis l'appareil photo ou la galerie
- **Sauvegarde automatique** : Mise à jour en temps réel
- **Validation** : Vérification des champs obligatoires

### Utilisation

```typescript
// Dans un écran
import { useProfile } from '../hooks/useProfile';

const { profile, updateProfile } = useProfile();

// Avec le composant ProfileInfo
import ProfileInfo from '../components/ProfileInfo';

<ProfileInfo size="large" showEmail={true} />
```

Pour plus de détails, consultez [docs/PROFILE_SYSTEM.md](docs/PROFILE_SYSTEM.md).

## 🚀 Déploiement

### Développement
```bash
npm start
```

### Production
```bash
# Build pour Android
eas build --platform android

# Build pour iOS
eas build --platform ios
```

## 📞 Support

Pour toute question ou problème :
1. Vérifiez que le schéma de base de données est bien exécuté
2. Assurez-vous que l'authentification par email est activée dans Supabase
3. Vérifiez les logs de l'application
4. Consultez la documentation dans le dossier `docs/`

## 🔐 Sécurité

- Toutes les tables utilisent Row Level Security (RLS)
- Les politiques de sécurité sont configurées pour chaque table
- L'authentification est gérée par Supabase Auth (Magic Link)
- Les routes protégées utilisent AuthGuard
- Pas de stockage de mots de passe
- Les utilisateurs ne peuvent accéder qu'à leur propre profil

## 📝 Notes

- L'application utilise l'authentification par email (Magic Link)
- Les utilisateurs reçoivent un lien de connexion sécurisé par email
- Les utilisateurs sont créés automatiquement lors de la première connexion
- Pas de coûts supplémentaires pour les SMS
- Fonctionne partout dans le monde
- Le profil utilisateur est créé automatiquement lors de l'inscription

## 🔄 Migration depuis l'authentification par téléphone

Si vous migrez depuis l'authentification par téléphone :

1. **Mettre à jour le schéma** :
   ```sql
   ALTER TABLE profiles 
   DROP CONSTRAINT IF EXISTS profiles_phone_key;
   
   ALTER TABLE profiles 
   ADD CONSTRAINT profiles_email_key UNIQUE (email);
   ```

2. **Configurer l'authentification par email** dans Supabase
3. **Tester avec des adresses email valides**
