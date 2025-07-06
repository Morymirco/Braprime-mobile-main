# 🚫 Guide de Test du Statut "no_show"

## 📋 Vue d'ensemble

Ce guide vous aide à tester le statut `no_show` pour les réservations et vérifier que les notifications automatiques fonctionnent correctement.

## ✅ Modifications apportées

### 1. **Script de triggers optimisé** (`database/notification-triggers.sql`)
- ✅ **Réinitialisation complète** au début pour exécution multiple
- ✅ **Statut `no_show` ajouté** dans les triggers de réservation
- ✅ **Message de confirmation** avec tous les statuts supportés
- ✅ **Gestion d'erreurs améliorée**

### 2. **Script de test spécialisé** (`test-no-show-notification.js`)
- ✅ **Test spécifique** du statut `no_show`
- ✅ **Test de tous les statuts** de réservation
- ✅ **Vérification automatique** des notifications créées
- ✅ **Nettoyage des données** de test

## 🧪 Étapes de test

### Étape 1 : Exécuter le script de triggers

```sql
-- Dans votre éditeur SQL Supabase
\i database/notification-triggers.sql
```

**Résultat attendu :**
```
✅ Script de triggers de notifications exécuté avec succès !
📋 Triggers créés :
   - trigger_notify_order_status_change (commandes)
   - trigger_notify_new_order (nouvelles commandes)
   - trigger_notify_reservation_status_change (réservations)
   - trigger_notify_new_reservation (nouvelles réservations)
   - trigger_notify_table_assignment (assignation de table)
📧 Statuts supportés pour les réservations : confirmed, cancelled, completed, no_show
📦 Statuts supportés pour les commandes : confirmed, preparing, ready, picked_up, delivered, cancelled
```

### Étape 2 : Configurer le script de test

1. **Modifier `test-no-show-notification.js` :**
   ```javascript
   const supabaseUrl = 'VOTRE_VRAIE_SUPABASE_URL';
   const supabaseKey = 'VOTRE_VRAIE_SUPABASE_ANON_KEY';
   const TEST_USER_ID = 'VOTRE_VRAI_USER_ID';
   ```

2. **Installer les dépendances :**
   ```bash
   npm install @supabase/supabase-js
   ```

### Étape 3 : Tester le statut no_show

```bash
# Test spécifique du statut no_show
node test-no-show-notification.js test-no-show
```

**Résultat attendu :**
```
📅 Création d'une réservation de test...
✅ Réservation créée avec succès !
📋 ID de la réservation: uuid-de-la-reservation
🚫 Test du statut no_show...
✅ Statut changé vers no_show avec succès !
🔍 Vérification de la notification créée...
✅ Notification trouvée !
📧 Titre: Absence signalée
📝 Message: Votre réservation chez Restaurant Test pour le 15/01/2024 à 19:00 a été marquée comme absence.
🏷️  Priorité: medium
📊 Données: {"reservation_id": "uuid", "business_name": "Restaurant Test", "status": "no_show", ...}
⏰ Créée: 15/01/2024, 14:30:25
✅ Notification correcte pour le statut no_show
```

### Étape 4 : Tester tous les statuts

```bash
# Test de tous les statuts de réservation
node test-no-show-notification.js test-all-statuses
```

**Résultat attendu :**
```
🧪 Test de tous les statuts de réservation...

📋 Test du statut: confirmed
✅ Statut confirmed appliqué avec succès
✅ Notification correcte pour le statut confirmed

📋 Test du statut: cancelled
✅ Statut cancelled appliqué avec succès
✅ Notification correcte pour le statut cancelled

📋 Test du statut: completed
✅ Statut completed appliqué avec succès
✅ Notification correcte pour le statut completed

📋 Test du statut: no_show
✅ Statut no_show appliqué avec succès
✅ Notification correcte pour le statut no_show
```

### Étape 5 : Vérifier dans l'application

1. **Lancer l'application :**
   ```bash
   npm start
   ```

2. **Vérifier l'icône de notification :**
   - Le badge devrait afficher le nombre de notifications non lues
   - Taper sur l'icône pour ouvrir la page des notifications

3. **Vérifier la notification no_show :**
   - La notification "Absence signalée" devrait apparaître
   - Vérifier le message et les détails

## 🔍 Vérifications à effectuer

### ✅ Notification no_show
- [ ] **Titre :** "Absence signalée"
- [ ] **Message :** Contient la date et l'heure de la réservation
- [ ] **Priorité :** "medium"
- [ ] **Type :** "reservation"
- [ ] **Données :** Contient `status: "no_show"`

### ✅ Tous les statuts de réservation
- [ ] **confirmed :** "Réservation confirmée" (priorité medium)
- [ ] **cancelled :** "Réservation annulée" (priorité high)
- [ ] **completed :** "Réservation terminée" (priorité low)
- [ ] **no_show :** "Absence signalée" (priorité medium)

### ✅ Fonctionnalités de l'application
- [ ] **Badge de notification** se met à jour
- [ ] **Page des notifications** affiche correctement
- [ ] **Marquer comme lue** fonctionne
- [ ] **Suppression** fonctionne

## 🧹 Nettoyage

Après les tests, nettoyez les données de test :

```bash
# Nettoyer les données de test
node test-no-show-notification.js cleanup
```

Ou lister les notifications pour vérifier :

```bash
# Lister les notifications récentes
node test-no-show-notification.js list
```

## 🐛 Dépannage

### Problème : Le trigger ne s'exécute pas
- **Solution :** Vérifier que le script de triggers a été exécuté
- **Solution :** Vérifier les logs PostgreSQL pour les erreurs

### Problème : Notification non créée
- **Solution :** Vérifier que l'utilisateur existe dans `auth.users`
- **Solution :** Vérifier les permissions RLS sur la table `notifications`

### Problème : Message incorrect
- **Solution :** Vérifier que les données de réservation sont complètes
- **Solution :** Vérifier le formatage des dates

### Problème : Erreur de base de données
- **Solution :** Vérifier que les tables `reservations` et `notifications` existent
- **Solution :** Vérifier les contraintes et les types de données

## 📊 Tests manuels supplémentaires

### Test 1 : Assignation de table
```sql
-- Créer une réservation
INSERT INTO reservations (user_id, business_id, business_name, date, time, guests, status)
VALUES ('user-uuid', 1, 'Restaurant Test', '2024-01-15', '19:00', 2, 'confirmed');

-- Assigner une table
UPDATE reservations 
SET table_number = 5 
WHERE user_id = 'user-uuid' AND business_name = 'Restaurant Test';
```

### Test 2 : Changement de statut manuel
```sql
-- Changer vers no_show
UPDATE reservations 
SET status = 'no_show' 
WHERE user_id = 'user-uuid' AND business_name = 'Restaurant Test';
```

### Test 3 : Vérifier les notifications créées
```sql
-- Lister les notifications récentes
SELECT 
  title,
  message,
  priority,
  data->>'status' as status,
  created_at
FROM notifications 
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC
LIMIT 5;
```

## 🎯 Résultats attendus

### ✅ Script de triggers
- Tous les triggers créés sans erreur
- Message de confirmation affiché
- Fonctions disponibles pour utilisation manuelle

### ✅ Test no_show
- Réservation créée avec succès
- Statut changé vers no_show
- Notification "Absence signalée" créée
- Données JSONB correctes

### ✅ Application
- Badge de notification mis à jour
- Page des notifications fonctionnelle
- Interface utilisateur réactive

## 🎉 Conclusion

Une fois tous les tests passés, votre système de notifications avec le statut `no_show` est opérationnel ! 

**Prochaines étapes :**
1. Intégrer les notifications dans le workflow métier
2. Ajouter des notifications push
3. Implémenter des filtres par type de notification
4. Ajouter des statistiques de notifications 