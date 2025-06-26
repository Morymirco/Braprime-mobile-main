# Système de Détail des Businesses

## Vue d'ensemble

Ce document décrit l'implémentation du système de détail des businesses dans l'application BraPrime Mobile. Le système permet aux utilisateurs de consulter les détails d'un business, son menu, et d'ajouter des produits à leur panier.

## Architecture

### Pages principales

1. **Page de détail du business** (`app/businesses/[id].tsx`)
   - Affiche les informations complètes d'un business
   - Navigation vers le menu
   - Actions de contact (appel, email)
   - Informations de livraison

2. **Page du menu** (`app/businesses/[id]/menu.tsx`)
   - Liste des produits disponibles
   - Filtrage par catégorie
   - Recherche de produits
   - Modal de détail des produits

### Services

1. **BusinessService** (`lib/services/BusinessService.ts`)
   - Récupération des informations d'un business
   - Recherche de businesses
   - Gestion des types de business

2. **MenuService** (`lib/services/MenuService.ts`)
   - Gestion des produits/menu items
   - Catégories de menu
   - Options de personnalisation
   - Avis sur les produits

### Hooks personnalisés

1. **useBusiness** (`hooks/useBusiness.ts`)
   - Gestion des données d'un business spécifique
   - État de chargement et d'erreur
   - Fonction de rafraîchissement

2. **useMenuItems** (`hooks/useMenu.ts`)
   - Récupération des produits d'un business
   - Gestion des catégories
   - Recherche de produits

### Composants

1. **MenuItemDetail** (`components/MenuItemDetail.tsx`)
   - Modal de détail d'un produit
   - Sélection de quantité
   - Informations nutritionnelles
   - Allergènes

## Fonctionnalités

### Page de détail du business

- **Informations générales**
  - Nom et description
  - Type de business avec badge coloré
  - Note et nombre d'avis
  - Statut ouvert/fermé

- **Actions principales**
  - Voir le menu
  - Commander directement
  - Appeler le business
  - Envoyer un email

- **Informations pratiques**
  - Adresse complète
  - Horaires d'ouverture
  - Temps de livraison
  - Frais de livraison
  - Type de cuisine (si applicable)

### Page du menu

- **Interface de recherche**
  - Barre de recherche en temps réel
  - Filtrage par catégorie
  - Affichage du nombre de résultats

- **Liste des produits**
  - Image, nom et description
  - Prix et disponibilité
  - Ajout rapide au panier
  - Navigation vers les détails

- **Modal de détail**
  - Image en grand format
  - Description complète
  - Informations nutritionnelles
  - Allergènes
  - Sélection de quantité
  - Ajout au panier

## Base de données

### Tables principales

1. **businesses**
   - Informations de base du business
   - Coordonnées et horaires
   - Statut et configuration

2. **menu_items**
   - Produits disponibles
   - Prix et disponibilité
   - Catégorisation
   - Informations nutritionnelles

3. **menu_categories**
   - Organisation des produits
   - Ordre d'affichage
   - Gestion des catégories

4. **menu_item_options**
   - Options de personnalisation
   - Prix supplémentaires
   - Contraintes de sélection

### Schéma SQL

Le fichier `database/menu-schema.sql` contient :
- Création des tables
- Index pour les performances
- Politiques de sécurité (RLS)
- Données de test

## Navigation

### Flux utilisateur

1. **Liste des businesses** → **Détail du business**
   - Navigation depuis la liste par type
   - Affichage des informations complètes

2. **Détail du business** → **Menu**
   - Accès au catalogue des produits
   - Filtrage et recherche

3. **Menu** → **Détail du produit**
   - Modal avec informations complètes
   - Ajout au panier

4. **Menu** → **Panier**
   - Accès direct au panier
   - Gestion des commandes

## Gestion d'état

### États locaux

- **Chargement** : Indicateurs visuels pendant les requêtes
- **Erreurs** : Messages d'erreur avec possibilité de retry
- **Recherche** : Filtrage en temps réel
- **Sélection** : Produit sélectionné pour les détails

### Rafraîchissement

- Pull-to-refresh sur les listes
- Mise à jour automatique des données
- Gestion des états de chargement

## Sécurité

### Politiques RLS

- Lecture publique des businesses actifs
- Lecture publique des produits disponibles
- Contrôle d'accès aux avis utilisateur
- Protection des données sensibles

### Validation

- Vérification des IDs de business
- Validation des données de formulaire
- Gestion des erreurs de requête

## Performance

### Optimisations

- Index sur les colonnes fréquemment utilisées
- Pagination des résultats (à implémenter)
- Mise en cache des images
- Lazy loading des composants

### Monitoring

- Logs d'erreur détaillés
- Métriques de performance
- Suivi des requêtes utilisateur

## Extensions futures

### Fonctionnalités à ajouter

1. **Système d'avis**
   - Notation des produits
   - Commentaires utilisateur
   - Modération des avis

2. **Personnalisation avancée**
   - Options multiples
   - Combinaisons spéciales
   - Préférences utilisateur

3. **Recommandations**
   - Produits populaires
   - Suggestions personnalisées
   - Historique des commandes

4. **Notifications**
   - Statut de commande
   - Promotions spéciales
   - Nouveaux produits

### Améliorations techniques

1. **Cache intelligent**
   - Mise en cache des menus
   - Synchronisation offline
   - Optimisation des requêtes

2. **Analytics**
   - Suivi des interactions
   - Métriques de conversion
   - A/B testing

3. **Accessibilité**
   - Support des lecteurs d'écran
   - Navigation au clavier
   - Contraste amélioré

## Tests

### Tests unitaires

- Validation des hooks
- Tests des services
- Vérification des composants

### Tests d'intégration

- Flux de navigation
- Gestion des erreurs
- Performance des requêtes

### Tests utilisateur

- Expérience utilisateur
- Facilité d'utilisation
- Performance perçue

## Déploiement

### Configuration

- Variables d'environnement
- Configuration Supabase
- Paramètres de build

### Monitoring

- Logs d'application
- Métriques de performance
- Alertes d'erreur

## Support

### Documentation

- Guides utilisateur
- Documentation technique
- FAQ

### Maintenance

- Mises à jour régulières
- Corrections de bugs
- Améliorations continues 