-- Table pour les commerces favoris
CREATE TABLE IF NOT EXISTS favorite_businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte unique pour éviter les doublons
  UNIQUE(user_id, business_id)
);

-- Table pour les articles de menu favoris
CREATE TABLE IF NOT EXISTS favorite_menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte unique pour éviter les doublons
  UNIQUE(user_id, menu_item_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_favorite_businesses_user_id ON favorite_businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_businesses_business_id ON favorite_businesses(business_id);
CREATE INDEX IF NOT EXISTS idx_favorite_businesses_created_at ON favorite_businesses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_favorite_menu_items_user_id ON favorite_menu_items(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_menu_items_menu_item_id ON favorite_menu_items(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_favorite_menu_items_created_at ON favorite_menu_items(created_at DESC);

-- Politiques RLS (Row Level Security)
ALTER TABLE favorite_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_menu_items ENABLE ROW LEVEL SECURITY;

-- Politiques pour favorite_businesses
CREATE POLICY "Users can view their own favorite businesses" ON favorite_businesses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorite businesses" ON favorite_businesses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite businesses" ON favorite_businesses
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour favorite_menu_items
CREATE POLICY "Users can view their own favorite menu items" ON favorite_menu_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorite menu items" ON favorite_menu_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite menu items" ON favorite_menu_items
  FOR DELETE USING (auth.uid() = user_id);

-- Fonction pour obtenir les statistiques des favoris d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_favorites_stats(user_uuid UUID)
RETURNS TABLE (
  total_businesses BIGINT,
  total_menu_items BIGINT,
  last_added_business TIMESTAMP WITH TIME ZONE,
  last_added_menu_item TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM favorite_businesses WHERE user_id = user_uuid) as total_businesses,
    (SELECT COUNT(*) FROM favorite_menu_items WHERE user_id = user_uuid) as total_menu_items,
    (SELECT MAX(created_at) FROM favorite_businesses WHERE user_id = user_uuid) as last_added_business,
    (SELECT MAX(created_at) FROM favorite_menu_items WHERE user_id = user_uuid) as last_added_menu_item;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour nettoyer les favoris orphelins (si un commerce ou article est supprimé)
CREATE OR REPLACE FUNCTION cleanup_orphaned_favorites()
RETURNS void AS $$
BEGIN
  -- Supprimer les favoris de commerces qui n'existent plus
  DELETE FROM favorite_businesses 
  WHERE business_id NOT IN (SELECT id FROM businesses);
  
  -- Supprimer les favoris d'articles qui n'existent plus
  DELETE FROM favorite_menu_items 
  WHERE menu_item_id NOT IN (SELECT id FROM menu_items);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Déclencheur pour nettoyer automatiquement les favoris orphelins
CREATE OR REPLACE FUNCTION trigger_cleanup_orphaned_favorites()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM cleanup_orphaned_favorites();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Créer le déclencheur sur la table businesses
CREATE TRIGGER cleanup_favorites_after_business_delete
  AFTER DELETE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION trigger_cleanup_orphaned_favorites();

-- Créer le déclencheur sur la table menu_items
CREATE TRIGGER cleanup_favorites_after_menu_item_delete
  AFTER DELETE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_cleanup_orphaned_favorites(); 