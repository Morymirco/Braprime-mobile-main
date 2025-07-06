# 🚀 Guide de Test du Système de Notifications

## 📋 Vue d'ensemble

Le système de notifications a été ajouté à l'application BraPrime avec les fonctionnalités suivantes :

- **Icône de notification** dans l'app bar de la page d'accueil
- **Badge de compteur** pour les notifications non lues
- **Page dédiée** pour afficher et gérer les notifications
- **Service complet** pour interagir avec la base de données
- **Hook React** pour gérer l'état des notifications

## 🛠️ Composants créés

### 1. Service de notifications
- **Fichier :** `lib/services/NotificationService.ts`
- **Fonctionnalités :**
  - Récupérer toutes les notifications d'un utilisateur
  - Compter les notifications non lues
  - Marquer comme lues (une ou toutes)
  - Supprimer des notifications
  - Créer de nouvelles notifications

### 2. Hook React
- **Fichier :** `hooks/useNotifications.ts`
- **Fonctionnalités :**
  - État de chargement et d'erreur
  - Gestion automatique des notifications
  - Mise à jour en temps réel du compteur

### 3. Page de notifications
- **Fichier :** `app/notifications.tsx`
- **Fonctionnalités :**
  - Liste des notifications avec statut lu/non lu
  - Actions pour marquer comme lues
  - Suppression de notifications
  - Interface utilisateur intuitive

### 4. Intégration dans l'app bar
- **Fichier :** `app/(tabs)/index.tsx`
- **Fonctionnalités :**
  - Icône de notification avec badge
  - Navigation vers la page des notifications
  - Affichage du nombre de notifications non lues

## 🧪 Comment tester

### Étape 1 : Configuration du script de test

1. **Modifier le fichier `test-notifications.js` :**
   ```javascript
   const supabaseUrl = 'VOTRE_VRAIE_SUPABASE_URL';
   const supabaseKey = 'VOTRE_VRAIE_SUPABASE_ANON_KEY';
   const TEST_USER_ID = 'VOTRE_VRAI_USER_ID';
   ```

2. **Installer les dépendances si nécessaire :**
   ```bash
   npm install @supabase/supabase-js
   ```

### Étape 2 : Créer des notifications de test

```bash
node test-notifications.js create
```

Cela créera 5 notifications de test :
- ✅ Commande confirmée (non lue)
- 🔴 Livraison en cours (non lue, priorité haute)
- ✅ Réservation confirmée (lue)
- 🔴 Paiement réussi (non lue)
- 🔴 Offre spéciale (non lue)

### Étape 3 : Tester dans l'application

1. **Lancer l'application :**
   ```bash
   npm start
   ```

2. **Vérifier l'icône de notification :**
   - L'icône devrait apparaître dans l'app bar de la page d'accueil
   - Un badge rouge devrait afficher "4" (notifications non lues)

3. **Tester la navigation :**
   - Taper sur l'icône de notification
   - Vérifier que la page des notifications s'ouvre

4. **Tester les fonctionnalités :**
   - **Marquer comme lue :** Taper sur une notification non lue
   - **Marquer toutes comme lues :** Utiliser le bouton "Tout marquer"
   - **Supprimer :** Appuyer longuement sur une notification

### Étape 4 : Vérifier les mises à jour

1. **Retourner à la page d'accueil**
2. **Vérifier que le badge se met à jour :**
   - Le compteur devrait diminuer quand vous marquez des notifications comme lues
   - Le badge devrait disparaître quand toutes les notifications sont lues

## 🔍 Fonctionnalités à tester

### ✅ Icône et badge
- [ ] L'icône de notification apparaît dans l'app bar
- [ ] Le badge affiche le bon nombre de notifications non lues
- [ ] Le badge disparaît quand il n'y a pas de notifications non lues
- [ ] Le badge affiche "99+" pour plus de 99 notifications

### ✅ Navigation
- [ ] Taper sur l'icône ouvre la page des notifications
- [ ] Le bouton retour fonctionne correctement
- [ ] La navigation est fluide

### ✅ Page des notifications
- [ ] La liste des notifications s'affiche correctement
- [ ] Les notifications non lues ont un indicateur visuel
- [ ] Les notifications sont triées par date (plus récentes en premier)
- [ ] L'état vide s'affiche quand il n'y a pas de notifications

### ✅ Actions sur les notifications
- [ ] Taper sur une notification la marque comme lue
- [ ] Le bouton "Tout marquer" fonctionne
- [ ] Appuyer longuement permet de supprimer une notification
- [ ] Les confirmations de suppression s'affichent

### ✅ Mise à jour en temps réel
- [ ] Le compteur se met à jour après avoir marqué des notifications comme lues
- [ ] Le compteur se met à jour après avoir supprimé des notifications
- [ ] Les changements sont reflétés immédiatement dans l'UI

### ✅ États de chargement et d'erreur
- [ ] L'état de chargement s'affiche pendant le chargement
- [ ] Les erreurs sont gérées et affichées correctement
- [ ] Le bouton "Réessayer" fonctionne

## 🧹 Nettoyage

Après les tests, vous pouvez nettoyer les notifications de test :

```bash
node test-notifications.js cleanup
```

Ou lister les notifications existantes :

```bash
node test-notifications.js list
```

## 🐛 Dépannage

### Problème : L'icône de notification n'apparaît pas
- **Solution :** Vérifier que l'utilisateur est connecté
- **Solution :** Vérifier que le hook `useNotifications` est bien importé

### Problème : Le badge ne se met pas à jour
- **Solution :** Vérifier que les notifications ont bien `is_read: false`
- **Solution :** Vérifier que l'ID utilisateur correspond

### Problème : Erreur de base de données
- **Solution :** Vérifier que les tables `notifications` et `notification_types` existent
- **Solution :** Vérifier les permissions RLS (Row Level Security)

### Problème : Navigation ne fonctionne pas
- **Solution :** Vérifier que le fichier `app/notifications.tsx` existe
- **Solution :** Vérifier que la route est correctement configurée

## 📝 Notes importantes

1. **Base de données :** Le système utilise les tables `notifications` et `notification_types` existantes
2. **Authentification :** Le système fonctionne uniquement pour les utilisateurs connectés
3. **Performance :** Les notifications sont chargées au démarrage de l'application
4. **Sécurité :** Les utilisateurs ne peuvent voir que leurs propres notifications

## 🎯 Prochaines étapes

Une fois le système de base testé, vous pourrez :

1. **Ajouter des notifications automatiques** pour les commandes, réservations, etc.
2. **Implémenter les notifications push** avec Expo Notifications
3. **Ajouter des filtres** par type de notification
4. **Créer des notifications en temps réel** avec Supabase Realtime
5. **Ajouter des animations** pour les nouvelles notifications 