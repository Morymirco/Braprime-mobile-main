-- ============================================================================
-- TRIGGERS AUTOMATIQUES POUR LES NOTIFICATIONS
-- ============================================================================
-- Ce script crée des fonctions et triggers pour automatiser la création 
-- de notifications lors d'événements importants dans l'application

-- ============================================================================
-- 0. RÉINITIALISATION COMPLÈTE (pour permettre l'exécution multiple)
-- ============================================================================

-- Supprimer tous les triggers existants
DROP TRIGGER IF EXISTS trigger_notify_order_status_change ON orders;
DROP TRIGGER IF EXISTS trigger_notify_new_order ON orders;
DROP TRIGGER IF EXISTS trigger_notify_reservation_status_change ON reservations;
DROP TRIGGER IF EXISTS trigger_notify_new_reservation ON reservations;
DROP TRIGGER IF EXISTS trigger_notify_table_assignment ON reservations;

-- Supprimer toutes les fonctions existantes
DROP FUNCTION IF EXISTS create_notification(UUID, VARCHAR, VARCHAR, TEXT, VARCHAR, JSONB);
DROP FUNCTION IF EXISTS notify_order_status_change();
DROP FUNCTION IF EXISTS notify_new_order();
DROP FUNCTION IF EXISTS notify_reservation_status_change();
DROP FUNCTION IF EXISTS notify_new_reservation();
DROP FUNCTION IF EXISTS notify_table_assignment();
DROP FUNCTION IF EXISTS create_promotional_notification(VARCHAR, TEXT, VARCHAR, JSONB);
DROP FUNCTION IF EXISTS create_system_notification(UUID, VARCHAR, TEXT, VARCHAR, JSONB);
DROP FUNCTION IF EXISTS create_maintenance_notification(VARCHAR, TEXT, VARCHAR);

-- ============================================================================
-- 1. FONCTION UTILITAIRE POUR CRÉER DES NOTIFICATIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_message TEXT,
  p_priority VARCHAR(20) DEFAULT 'medium',
  p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  -- Vérifier que l'utilisateur existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE WARNING 'Utilisateur % n''existe pas, notification non créée', p_user_id;
    RETURN NULL;
  END IF;

  -- Insérer la notification
  INSERT INTO notifications (
    user_id, 
    type, 
    title, 
    message, 
    priority, 
    data,
    created_at
  ) VALUES (
    p_user_id, 
    p_type, 
    p_title, 
    p_message, 
    p_priority, 
    p_data,
    NOW()
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. TRIGGERS POUR LES COMMANDES
-- ============================================================================

-- Fonction pour notifier les changements de statut des commandes
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  business_name VARCHAR(255);
  order_number VARCHAR(20);
BEGIN
  -- Récupérer le nom du commerce
  SELECT name INTO business_name 
  FROM businesses 
  WHERE id = NEW.business_id;
  
  -- Si le commerce n'existe pas, utiliser un nom par défaut
  IF business_name IS NULL THEN
    business_name := 'le restaurant';
  END IF;
  
  -- Générer un numéro de commande court
  order_number := substring(NEW.id::text from 1 for 8);
  
  -- Créer une notification selon le nouveau statut
  CASE NEW.status
    WHEN 'confirmed' THEN
      PERFORM create_notification(
        NEW.user_id,
        'order_status',
        'Commande confirmée',
        format('Votre commande #%s a été confirmée par %s.', order_number, business_name),
        'medium',
        jsonb_build_object(
          'order_id', NEW.id,
          'business_name', business_name,
          'status', NEW.status,
          'total', NEW.grand_total
        )
      );
      
    WHEN 'preparing' THEN
      PERFORM create_notification(
        NEW.user_id,
        'order_status',
        'Commande en préparation',
        format('Votre commande #%s est en cours de préparation chez %s.', order_number, business_name),
        'medium',
        jsonb_build_object(
          'order_id', NEW.id,
          'business_name', business_name,
          'status', NEW.status
        )
      );
      
    WHEN 'ready' THEN
      PERFORM create_notification(
        NEW.user_id,
        'order_status',
        'Commande prête',
        format('Votre commande #%s est prête pour la livraison.', order_number),
        'high',
        jsonb_build_object(
          'order_id', NEW.id,
          'business_name', business_name,
          'status', NEW.status
        )
      );
      
    WHEN 'picked_up' THEN
      PERFORM create_notification(
        NEW.user_id,
        'delivery_update',
        'Commande en livraison',
        format('Votre commande #%s est en cours de livraison par %s.', 
               order_number, COALESCE(NEW.driver_name, 'notre livreur')),
        'high',
        jsonb_build_object(
          'order_id', NEW.id,
          'business_name', business_name,
          'driver_name', COALESCE(NEW.driver_name, 'Notre livreur'),
          'driver_phone', NEW.driver_phone,
          'status', NEW.status
        )
      );
      
    WHEN 'delivered' THEN
      PERFORM create_notification(
        NEW.user_id,
        'order_status',
        'Commande livrée',
        format('Votre commande #%s a été livrée. Bon appétit !', order_number),
        'medium',
        jsonb_build_object(
          'order_id', NEW.id,
          'business_name', business_name,
          'status', NEW.status
        )
      );
      
    WHEN 'cancelled' THEN
      PERFORM create_notification(
        NEW.user_id,
        'order_status',
        'Commande annulée',
        format('Votre commande #%s a été annulée.', order_number),
        'high',
        jsonb_build_object(
          'order_id', NEW.id,
          'business_name', business_name,
          'status', NEW.status
        )
      );
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger pour les changements de statut des commandes
CREATE TRIGGER trigger_notify_order_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_order_status_change();

-- Fonction pour notifier les nouvelles commandes
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
DECLARE
  business_name VARCHAR(255);
  order_number VARCHAR(20);
BEGIN
  -- Récupérer le nom du commerce
  SELECT name INTO business_name 
  FROM businesses 
  WHERE id = NEW.business_id;
  
  -- Si le commerce n'existe pas, utiliser un nom par défaut
  IF business_name IS NULL THEN
    business_name := 'le restaurant';
  END IF;
  
  -- Générer un numéro de commande court
  order_number := substring(NEW.id::text from 1 for 8);
  
  -- Créer une notification pour la nouvelle commande
  PERFORM create_notification(
    NEW.user_id,
    'order_status',
    'Commande reçue',
    format('Votre commande #%s a été reçue et est en attente de confirmation.', order_number),
    'medium',
    jsonb_build_object(
      'order_id', NEW.id,
      'business_name', business_name,
      'total', NEW.grand_total,
      'status', NEW.status
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger pour les nouvelles commandes
CREATE TRIGGER trigger_notify_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();

-- ============================================================================
-- 3. TRIGGERS POUR LES RÉSERVATIONS
-- ============================================================================

-- Fonction pour notifier les changements de statut des réservations
CREATE OR REPLACE FUNCTION notify_reservation_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer une notification selon le nouveau statut
  CASE NEW.status
    WHEN 'confirmed' THEN
      PERFORM create_notification(
        NEW.user_id,
        'reservation',
        'Réservation confirmée',
        format('Votre réservation chez %s pour le %s à %s a été confirmée.', 
               NEW.business_name, 
               to_char(NEW.date, 'DD/MM/YYYY'), 
               NEW.time),
        'medium',
        jsonb_build_object(
          'reservation_id', NEW.id,
          'business_name', NEW.business_name,
          'status', NEW.status,
          'date', NEW.date,
          'time', NEW.time,
          'guests', NEW.guests
        )
      );
      
    WHEN 'cancelled' THEN
      PERFORM create_notification(
        NEW.user_id,
        'reservation',
        'Réservation annulée',
        format('Votre réservation chez %s pour le %s à %s a été annulée.', 
               NEW.business_name, 
               to_char(NEW.date, 'DD/MM/YYYY'), 
               NEW.time),
        'high',
        jsonb_build_object(
          'reservation_id', NEW.id,
          'business_name', NEW.business_name,
          'status', NEW.status,
          'date', NEW.date,
          'time', NEW.time
        )
      );
      
    WHEN 'completed' THEN
      PERFORM create_notification(
        NEW.user_id,
        'reservation',
        'Réservation terminée',
        format('Votre réservation chez %s pour le %s à %s a été marquée comme terminée.', 
               NEW.business_name, 
               to_char(NEW.date, 'DD/MM/YYYY'), 
               NEW.time),
        'low',
        jsonb_build_object(
          'reservation_id', NEW.id,
          'business_name', NEW.business_name,
          'status', NEW.status,
          'date', NEW.date,
          'time', NEW.time
        )
      );
      
    WHEN 'no_show' THEN
      PERFORM create_notification(
        NEW.user_id,
        'reservation',
        'Absence signalée',
        format('Votre réservation chez %s pour le %s à %s a été marquée comme absence.', 
               NEW.business_name, 
               to_char(NEW.date, 'DD/MM/YYYY'), 
               NEW.time),
        'medium',
        jsonb_build_object(
          'reservation_id', NEW.id,
          'business_name', NEW.business_name,
          'status', NEW.status,
          'date', NEW.date,
          'time', NEW.time,
          'guests', NEW.guests
        )
      );
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger pour les changements de statut des réservations
CREATE TRIGGER trigger_notify_reservation_status_change
  AFTER UPDATE OF status ON reservations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_reservation_status_change();

-- Fonction pour notifier les nouvelles réservations
CREATE OR REPLACE FUNCTION notify_new_reservation()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer une notification pour la nouvelle réservation
  PERFORM create_notification(
    NEW.user_id,
    'reservation',
    'Réservation en attente',
    format('Votre réservation chez %s pour le %s à %s est en attente de confirmation.', 
           NEW.business_name, 
           to_char(NEW.date, 'DD/MM/YYYY'), 
           NEW.time),
    'medium',
    jsonb_build_object(
      'reservation_id', NEW.id,
      'business_name', NEW.business_name,
      'date', NEW.date,
      'time', NEW.time,
      'guests', NEW.guests,
      'status', NEW.status
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger pour les nouvelles réservations
CREATE TRIGGER trigger_notify_new_reservation
  AFTER INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_reservation();

-- Fonction pour notifier l'assignation de table
CREATE OR REPLACE FUNCTION notify_table_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer une notification pour l'assignation de table
  IF NEW.table_number IS NOT NULL AND (OLD.table_number IS NULL OR OLD.table_number != NEW.table_number) THEN
    PERFORM create_notification(
      NEW.user_id,
      'reservation',
      'Table assignée',
      format('Votre table numéro %s a été assignée pour votre réservation chez %s.', 
             NEW.table_number, NEW.business_name),
      'medium',
      jsonb_build_object(
        'reservation_id', NEW.id,
        'business_name', NEW.business_name,
        'table_number', NEW.table_number,
        'date', NEW.date,
        'time', NEW.time
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger pour l'assignation de table
CREATE TRIGGER trigger_notify_table_assignment
  AFTER UPDATE OF table_number ON reservations
  FOR EACH ROW
  WHEN (OLD.table_number IS DISTINCT FROM NEW.table_number)
  EXECUTE FUNCTION notify_table_assignment();

-- ============================================================================
-- 4. FONCTIONS UTILITAIRES POUR NOTIFICATIONS MANUELLES
-- ============================================================================

-- Fonction pour créer des notifications promotionnelles
CREATE OR REPLACE FUNCTION create_promotional_notification(
  p_title VARCHAR(255),
  p_message TEXT,
  p_priority VARCHAR(20) DEFAULT 'low',
  p_data JSONB DEFAULT '{}'
)
RETURNS INTEGER AS $$
DECLARE
  user_record RECORD;
  notification_count INTEGER := 0;
BEGIN
  -- Créer une notification pour tous les utilisateurs clients
  FOR user_record IN 
    SELECT DISTINCT u.id 
    FROM auth.users u
    JOIN user_profiles up ON u.id = up.id
    WHERE up.role_id = 1  -- Supposons que 1 = client
  LOOP
    PERFORM create_notification(
      user_record.id,
      'promotion',
      p_title,
      p_message,
      p_priority,
      p_data
    );
    notification_count := notification_count + 1;
  END LOOP;
  
  RETURN notification_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer des notifications système
CREATE OR REPLACE FUNCTION create_system_notification(
  p_user_id UUID,
  p_title VARCHAR(255),
  p_message TEXT,
  p_priority VARCHAR(20) DEFAULT 'low',
  p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
BEGIN
  RETURN create_notification(
    p_user_id,
    'system',
    p_title,
    p_message,
    p_priority,
    p_data
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer des notifications de maintenance
CREATE OR REPLACE FUNCTION create_maintenance_notification(
  p_title VARCHAR(255),
  p_message TEXT,
  p_priority VARCHAR(20) DEFAULT 'medium'
)
RETURNS INTEGER AS $$
DECLARE
  user_record RECORD;
  notification_count INTEGER := 0;
BEGIN
  -- Créer une notification pour tous les utilisateurs
  FOR user_record IN 
    SELECT id FROM auth.users
  LOOP
    PERFORM create_notification(
      user_record.id,
      'maintenance',
      p_title,
      p_message,
      p_priority,
      jsonb_build_object('type', 'maintenance')
    );
    notification_count := notification_count + 1;
  END LOOP;
  
  RETURN notification_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. COMMENTAIRES ET DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION create_notification IS 'Fonction utilitaire pour créer une notification avec validation de l''utilisateur';
COMMENT ON FUNCTION notify_order_status_change IS 'Trigger pour notifier automatiquement les changements de statut des commandes';
COMMENT ON FUNCTION notify_new_order IS 'Trigger pour notifier automatiquement les nouvelles commandes';
COMMENT ON FUNCTION notify_reservation_status_change IS 'Trigger pour notifier automatiquement les changements de statut des réservations (inclut no_show)';
COMMENT ON FUNCTION notify_new_reservation IS 'Trigger pour notifier automatiquement les nouvelles réservations';
COMMENT ON FUNCTION notify_table_assignment IS 'Trigger pour notifier automatiquement l''assignation de table';
COMMENT ON FUNCTION create_promotional_notification IS 'Fonction pour créer des notifications promotionnelles pour tous les clients';
COMMENT ON FUNCTION create_system_notification IS 'Fonction pour créer des notifications système pour un utilisateur spécifique';
COMMENT ON FUNCTION create_maintenance_notification IS 'Fonction pour créer des notifications de maintenance pour tous les utilisateurs';

-- ============================================================================
-- 6. MESSAGE DE CONFIRMATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Script de triggers de notifications exécuté avec succès !';
  RAISE NOTICE '📋 Triggers créés :';
  RAISE NOTICE '   - trigger_notify_order_status_change (commandes)';
  RAISE NOTICE '   - trigger_notify_new_order (nouvelles commandes)';
  RAISE NOTICE '   - trigger_notify_reservation_status_change (réservations)';
  RAISE NOTICE '   - trigger_notify_new_reservation (nouvelles réservations)';
  RAISE NOTICE '   - trigger_notify_table_assignment (assignation de table)';
  RAISE NOTICE '📧 Statuts supportés pour les réservations : confirmed, cancelled, completed, no_show';
  RAISE NOTICE '📦 Statuts supportés pour les commandes : confirmed, preparing, ready, picked_up, delivered, cancelled';
END $$;

-- ============================================================================
-- 7. EXEMPLES D'UTILISATION
-- ============================================================================

/*
-- Exemple 1: Créer une notification promotionnelle
SELECT create_promotional_notification(
  'Offre spéciale !',
  'Profitez de 20% de réduction sur votre prochaine commande avec le code PROMO20.',
  'medium',
  '{"promo_code": "PROMO20", "discount": 20}'
);

-- Exemple 2: Créer une notification système pour un utilisateur
SELECT create_system_notification(
  'uuid-de-l-utilisateur',
  'Bienvenue !',
  'Merci de vous être inscrit sur BraPrime.',
  'low'
);

-- Exemple 3: Créer une notification de maintenance
SELECT create_maintenance_notification(
  'Maintenance prévue',
  'Le système sera en maintenance le 15 décembre de 2h à 4h du matin.',
  'high'
);

-- Exemple 4: Tester le statut no_show pour une réservation
UPDATE reservations 
SET status = 'no_show' 
WHERE id = 'reservation-uuid';
*/ 