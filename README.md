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
   cd braprime_mobile-main
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

4. **Configuration de l'authentification**
   
   L'application utilise l'authentification par SMS (OTP) via Supabase. Assurez-vous que :
   - L'authentification par téléphone est activée dans votre projet Supabase
   - Les numéros de téléphone guinéens (+224) sont autorisés

5. **Démarrer l'application**
   ```bash
   npm start
   ```

## 📱 Fonctionnalités

### Authentification
- ✅ Connexion par numéro de téléphone (OTP)
- ✅ Vérification automatique des codes
- ✅ Gestion des erreurs et retry
- ✅ Protection des routes authentifiées

### Base de données
- ✅ Schéma complet avec toutes les tables nécessaires
- ✅ Politiques de sécurité (RLS) configurées
- ✅ Triggers automatiques pour les profils utilisateurs
- ✅ Données initiales (catégories)

### Interface utilisateur
- ✅ Écran de connexion avec clavier numérique
- ✅ Écran de vérification OTP
- ✅ Navigation par onglets
- ✅ Design moderne et responsive

## 🏗️ Architecture

```
app/
├── (tabs)/           # Pages principales (protégées par AuthGuard)
├── login.tsx         # Écran de connexion
├── verify.tsx        # Écran de vérification OTP
└── _layout.tsx       # Layout principal avec AuthProvider

lib/
├── contexts/
│   └── AuthContext.tsx    # Contexte d'authentification
├── components/
│   └── AuthGuard.tsx      # Protection des routes
├── hooks/
│   └── useSupabaseAuth.ts # Hook d'authentification
└── supabase/
    └── config.ts          # Configuration Supabase

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
- `profiles` - Profils utilisateurs
- `addresses` - Adresses de livraison
- `categories` - Catégories de services
- `stores` - Magasins et restaurants
- `products` - Produits
- `orders` - Commandes
- `order_items` - Éléments de commande
- `wallets` - Portefeuilles utilisateurs
- `wallet_transactions` - Transactions
- `favorites` - Favoris

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
2. Assurez-vous que l'authentification par SMS est activée dans Supabase
3. Vérifiez les logs de l'application

## 🔐 Sécurité

- Toutes les tables utilisent Row Level Security (RLS)
- Les politiques de sécurité sont configurées pour chaque table
- L'authentification est gérée par Supabase Auth
- Les routes protégées utilisent AuthGuard

## 📝 Notes

- L'application est configurée pour la Guinée (+224)
- Les numéros de téléphone doivent avoir 9 chiffres
- Le code OTP est de 6 chiffres
- Les utilisateurs sont créés automatiquement lors de la première connexion
