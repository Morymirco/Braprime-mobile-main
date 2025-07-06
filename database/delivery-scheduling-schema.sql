-- Script pour ajouter la gestion des livraisons programmées
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Ajouter les nouveaux champs à la table orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS preferred_delivery_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS delivery_type character varying DEFAULT 'asap' CHECK (delivery_type IN ('asap', 'scheduled')),
ADD COLUMN IF NOT EXISTS available_for_drivers boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS scheduled_delivery_window_start timestamp with time zone,
ADD COLUMN IF NOT EXISTS scheduled_delivery_window_end timestamp with time zone;

-- 2. Créer une table pour les fenêtres de livraison disponibles
CREATE TABLE IF NOT EXISTS public.delivery_time_slots (
  id SERIAL PRIMARY KEY,
  business_id integer,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Dimanche, 6 = Samedi
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  is_active boolean DEFAULT true,
  max_orders_per_slot integer DEFAULT 10,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT delivery_time_slots_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id)
);

-- 3. Créer une table pour les commandes disponibles pour les chauffeurs
CREATE TABLE IF NOT EXISTS public.available_orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL,
  business_id integer NOT NULL,
  business_name character varying NOT NULL,
  delivery_address text NOT NULL,
  estimated_delivery_time timestamp with time zone,
  delivery_fee integer DEFAULT 0,
  total_amount integer NOT NULL,
  is_urgent boolean DEFAULT false,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT available_orders_pkey PRIMARY KEY (id),
  CONSTRAINT available_orders_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT available_orders_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id)
);

-- 4. Créer des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_orders_delivery_type ON public.orders(delivery_type);
CREATE INDEX IF NOT EXISTS idx_orders_preferred_delivery_time ON public.orders(preferred_delivery_time);
CREATE INDEX IF NOT EXISTS idx_orders_available_for_drivers ON public.orders(available_for_drivers);
CREATE INDEX IF NOT EXISTS idx_available_orders_expires_at ON public.available_orders(expires_at);
CREATE INDEX IF NOT EXISTS idx_available_orders_business_id ON public.available_orders(business_id);

-- 5. Insérer des fenêtres de livraison par défaut (exemple)
INSERT INTO public.delivery_time_slots (business_id, day_of_week, start_time, end_time, max_orders_per_slot) VALUES
-- Lundi à Vendredi (1-5)
(NULL, 1, '08:00:00', '12:00:00', 10),
(NULL, 1, '12:00:00', '14:00:00', 15),
(NULL, 1, '18:00:00', '22:00:00', 20),
(NULL, 2, '08:00:00', '12:00:00', 10),
(NULL, 2, '12:00:00', '14:00:00', 15),
(NULL, 2, '18:00:00', '22:00:00', 20),
(NULL, 3, '08:00:00', '12:00:00', 10),
(NULL, 3, '12:00:00', '14:00:00', 15),
(NULL, 3, '18:00:00', '22:00:00', 20),
(NULL, 4, '08:00:00', '12:00:00', 10),
(NULL, 4, '12:00:00', '14:00:00', 15),
(NULL, 4, '18:00:00', '22:00:00', 20),
(NULL, 5, '08:00:00', '12:00:00', 10),
(NULL, 5, '12:00:00', '14:00:00', 15),
(NULL, 5, '18:00:00', '22:00:00', 20),
-- Samedi et Dimanche (6, 0)
(NULL, 6, '10:00:00', '14:00:00', 15),
(NULL, 6, '18:00:00', '23:00:00', 25),
(NULL, 0, '10:00:00', '14:00:00', 15),
(NULL, 0, '18:00:00', '23:00:00', 25)
ON CONFLICT DO NOTHING;

-- 6. Créer une fonction pour vérifier la disponibilité des créneaux
CREATE OR REPLACE FUNCTION check_delivery_slot_availability(
  p_business_id integer,
  p_delivery_date date,
  p_delivery_time time
) RETURNS boolean AS $$
DECLARE
  day_of_week integer;
  slot_exists boolean;
  current_orders integer;
  max_orders integer;
BEGIN
  -- Obtenir le jour de la semaine (0 = Dimanche, 6 = Samedi)
  day_of_week := EXTRACT(DOW FROM p_delivery_date);
  
  -- Vérifier si le créneau existe
  SELECT EXISTS(
    SELECT 1 FROM delivery_time_slots 
    WHERE business_id = p_business_id OR business_id IS NULL
    AND day_of_week = $1
    AND start_time <= p_delivery_time 
    AND end_time > p_delivery_time
    AND is_active = true
  ) INTO slot_exists;
  
  IF NOT slot_exists THEN
    RETURN false;
  END IF;
  
  -- Compter les commandes existantes pour ce créneau
  SELECT COUNT(*) INTO current_orders
  FROM orders 
  WHERE business_id = p_business_id
  AND DATE(preferred_delivery_time) = p_delivery_date
  AND CAST(preferred_delivery_time AS time) BETWEEN 
    (SELECT start_time FROM delivery_time_slots 
     WHERE (business_id = p_business_id OR business_id IS NULL)
     AND day_of_week = $1
     AND start_time <= p_delivery_time 
     AND end_time > p_delivery_time
     LIMIT 1)
    AND
    (SELECT end_time FROM delivery_time_slots 
     WHERE (business_id = p_business_id OR business_id IS NULL)
     AND day_of_week = $1
     AND start_time <= p_delivery_time 
     AND end_time > p_delivery_time
     LIMIT 1);
  
  -- Obtenir le nombre maximum de commandes autorisées
  SELECT max_orders_per_slot INTO max_orders
  FROM delivery_time_slots 
  WHERE (business_id = p_business_id OR business_id IS NULL)
  AND day_of_week = $1
  AND start_time <= p_delivery_time 
  AND end_time > p_delivery_time
  LIMIT 1;
  
  RETURN current_orders < max_orders;
END;
$$ LANGUAGE plpgsql;

-- 7. Créer une fonction pour rendre une commande disponible pour les chauffeurs
CREATE OR REPLACE FUNCTION make_order_available_for_drivers(p_order_id uuid)
RETURNS void AS $$
DECLARE
  order_record record;
BEGIN
  -- Récupérer les informations de la commande
  SELECT * INTO order_record
  FROM orders 
  WHERE id = p_order_id;
  
  -- Vérifier que la commande est au statut "prêt" et de type "scheduled"
  IF order_record.status != 'ready' OR order_record.delivery_type != 'scheduled' THEN
    RAISE EXCEPTION 'La commande doit être au statut "ready" et de type "scheduled"';
  END IF;
  
  -- Marquer la commande comme disponible pour les chauffeurs
  UPDATE orders 
  SET available_for_drivers = true
  WHERE id = p_order_id;
  
  -- Ajouter à la table des commandes disponibles
  INSERT INTO available_orders (
    order_id, 
    business_id, 
    business_name, 
    delivery_address, 
    estimated_delivery_time,
    delivery_fee,
    total_amount,
    expires_at
  ) VALUES (
    p_order_id,
    order_record.business_id,
    order_record.business_name,
    order_record.delivery_address,
    order_record.preferred_delivery_time,
    order_record.delivery_fee,
    order_record.grand_total,
    order_record.preferred_delivery_time + INTERVAL '1 hour'
  );
END;
$$ LANGUAGE plpgsql;

-- 8. Créer une fonction pour assigner un chauffeur à une commande
CREATE OR REPLACE FUNCTION assign_driver_to_order(p_order_id uuid, p_driver_id uuid)
RETURNS void AS $$
BEGIN
  -- Mettre à jour la commande avec le chauffeur assigné
  UPDATE orders 
  SET 
    driver_id = p_driver_id,
    available_for_drivers = false,
    updated_at = now()
  WHERE id = p_order_id;
  
  -- Supprimer de la table des commandes disponibles
  DELETE FROM available_orders 
  WHERE order_id = p_order_id;
  
  -- Mettre à jour le chauffeur
  UPDATE drivers 
  SET 
    current_order_id = p_order_id,
    updated_at = now()
  WHERE id = p_driver_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Créer un trigger pour nettoyer les commandes expirées
CREATE OR REPLACE FUNCTION cleanup_expired_available_orders()
RETURNS void AS $$
BEGIN
  -- Supprimer les commandes disponibles expirées
  DELETE FROM available_orders 
  WHERE expires_at < now();
  
  -- Marquer les commandes correspondantes comme non disponibles
  UPDATE orders 
  SET available_for_drivers = false
  WHERE id IN (
    SELECT order_id FROM available_orders WHERE expires_at < now()
  );
END;
$$ LANGUAGE plpgsql;

-- 10. Créer un job pour nettoyer les commandes expirées (à exécuter toutes les heures)
-- Note: Cette fonction doit être appelée par un cron job ou un service externe
-- SELECT cleanup_expired_available_orders();

-- Afficher un résumé des modifications
SELECT 'Schema de livraison programmée créé avec succès' as status; 